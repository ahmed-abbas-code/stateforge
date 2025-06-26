import { GetServerSideProps } from 'next';
import { BasicStepWizard, WizardData } from '../components/BasicStepWizard';
import { NavigationStateStrategyImpl } from '@stateforge/core';

const defaultState: WizardData = { step: 1 };

export default function SampleWizardPage({ initialState }: { initialState: WizardData }) {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sample Wizard (SSR)</h1>
      <BasicStepWizard keyName="sample-wizard" defaultState={defaultState} initialState={initialState} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const navStrategy = new NavigationStateStrategyImpl<WizardData>();
  const key = 'sample-wizard';
  const initialState = await navStrategy.load(key, { req: context.req });

  return {
    props: {
      initialState: initialState ?? defaultState,
    },
  };
};
