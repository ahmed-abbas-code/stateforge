import { useEffect } from 'react';
import { GetServerSideProps } from 'next';

import {
  useNavigationPersistedState,
  NavigationStateStrategyImpl,
} from '@stateforge/core';

interface SampleState {
  step: number;
  name: string;
  email: string;
}

const defaultState: SampleState = {
  step: 1,
  name: '',
  email: '',
};

export default function SampleWizardPage({ initialState }: { initialState: SampleState }) {
  const [state, setState] = useNavigationPersistedState<SampleState>('sample-wizard', initialState);

  const nextStep = () => setState({ ...state, step: state.step + 1 });
  const prevStep = () => setState({ ...state, step: state.step - 1 });

  useEffect(() => {
    console.log('Restored wizard state:', state);
  }, [state]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sample Wizard (SSR + Navigation State)</h1>

      {state.step === 1 && (
        <div className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            type="text"
            placeholder="Name"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={nextStep}>
            Next
          </button>
        </div>
      )}

      {state.step === 2 && (
        <div className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            type="email"
            placeholder="Email"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
          />
          <div className="flex space-x-2">
            <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={prevStep}>
              Back
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={nextStep}>
              Continue
            </button>
          </div>
        </div>
      )}

      {state.step === 3 && (
        <div className="space-y-2">
          <p><strong>Name:</strong> {state.name}</p>
          <p><strong>Email:</strong> {state.email}</p>
          <div className="flex space-x-2">
            <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={prevStep}>
              Back
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => setState(defaultState)}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const navStrategy = new NavigationStateStrategyImpl();
  const key = 'sample-wizard';
  const initialState = await navStrategy.load<SampleState>(key, { req: context.req });

  return {
    props: {
      initialState: initialState ?? defaultState,
    },
  };
};
