'use client';

import { useNavigationPersistedState } from '@stateforge/core';

export interface WizardData {
  step: number;
  name?: string;
  email?: string;
}

export interface BasicStepWizardProps {
  keyName?: string;
  defaultState?: WizardData;
  initialState?: WizardData;
}

const DEFAULT: WizardData = { step: 1 };

export const BasicStepWizard = ({
  keyName = 'wizard',
  defaultState = DEFAULT,
  initialState,
}: BasicStepWizardProps) => {
  const [data, setData] = useNavigationPersistedState<WizardData>({
    key: keyName,
    defaultValue: defaultState,
    initialState,
  });

  const next = () => setData({ ...data, step: data.step + 1 });
  const back = () => setData({ ...data, step: data.step - 1 });

  return (
    <div className="p-4 border rounded space-y-4">
      <h2 className="font-semibold text-lg">Step Wizard</h2>

      {data.step === 1 && (
        <input
          className="w-full p-2 border rounded"
          placeholder="Name"
          value={data.name || ''}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      )}

      {data.step === 2 && (
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={data.email || ''}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
      )}

      {data.step === 3 && (
        <div>
          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Email:</strong> {data.email}</p>
        </div>
      )}

      <div className="flex gap-2">
        {data.step > 1 && (
          <button onClick={back} className="bg-gray-500 text-white px-4 py-2 rounded">
            Back
          </button>
        )}
        {data.step < 3 ? (
          <button onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded">
            Next
          </button>
        ) : (
          <button
            onClick={() => setData(defaultState)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
