import { useNavigationPersistedState } from '@stateforge/core';

interface WizardData {
  step: number;
  email?: string;
}

const defaultData: WizardData = { step: 1 };

export const SampleStepWizard = () => {
  const [data, setData] = useNavigationPersistedState<WizardData>('wizard', defaultData);

  const next = () => setData({ ...data, step: data.step + 1 });
  const back = () => setData({ ...data, step: data.step - 1 });

  return (
    <div className="p-4 border rounded">
      {data.step === 1 && (
        <div>
          <h3 className="font-semibold mb-2">Step 1</h3>
          <input
            placeholder="Enter email"
            value={data.email || ''}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className="border p-2 w-full"
          />
          <button onClick={next} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Next</button>
        </div>
      )}
      {data.step === 2 && (
        <div>
          <h3 className="font-semibold mb-2">Step 2</h3>
          <p>Email: {data.email}</p>
          <div className="flex space-x-2">
            <button onClick={back} className="bg-gray-500 text-white px-4 py-2 rounded">Back</button>
            <button onClick={() => setData(defaultData)} className="bg-red-600 text-white px-4 py-2 rounded">Reset</button>
          </div>
        </div>
      )}
    </div>
  );
};
