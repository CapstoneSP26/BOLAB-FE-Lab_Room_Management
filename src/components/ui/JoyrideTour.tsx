import React from 'react';
import {
  Joyride,
  type EventHandler,
  type Step,
  type TooltipRenderProps,
  type BeaconRenderProps,
} from 'react-joyride';

interface JoyrideTourProps {
  run: boolean;
  steps: Step[];
  onEvent: EventHandler;
  tourKey?: number;
}

const TourBeacon: React.FC<BeaconRenderProps> = () => {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-300/70" />
      <span className="relative inline-flex h-4 w-4 rounded-full bg-orange-500 ring-4 ring-orange-100" />
    </span>
  );
};

const TourTooltip: React.FC<TooltipRenderProps> = ({
  backProps,
  closeProps,
  index,
  isLastStep,
  primaryProps,
  skipProps,
  size,
  step,
  tooltipProps,
}) => {
  return (
    <div
      {...tooltipProps}
      style={{ ...tooltipProps.style, marginTop: '12px' }}
      className="w-[min(92vw,420px)] rounded-2xl border border-orange-100 bg-white shadow-[0_20px_50px_-20px_rgba(249,115,22,0.45)]"
    >
      <div className="flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-orange-700">
          Huong dan booking
        </div>
        <button
          {...closeProps}
          className="rounded-md p-1 text-gray-500 transition-colors hover:bg-orange-100 hover:text-orange-700"
          aria-label={String(closeProps['aria-label'] ?? 'Close')}
        >
          x
        </button>
      </div>

      <div className="px-4 py-4">
        {step.title && (
          <h3 className="text-base font-bold leading-6 text-gray-900">
            {step.title}
          </h3>
        )}

        <div className="mt-2 text-sm leading-6 text-gray-700">{step.content}</div>

        <div className="mt-3 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          Buoc {index + 1}/{size}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-orange-100 px-4 py-3">
        <button
          {...skipProps}
          className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          Bo qua
        </button>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Quay lai
            </button>
          )}

          <button
            {...primaryProps}
            className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            {isLastStep ? 'Hoan tat' : 'Tiep theo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const JoyrideTour: React.FC<JoyrideTourProps> = ({ run, steps, onEvent, tourKey = 0 }) => {
  return (
    <Joyride
      key={tourKey}
      run={run}
      steps={steps}
      onEvent={onEvent}
      continuous
      scrollToFirstStep
      beaconComponent={TourBeacon}
      tooltipComponent={TourTooltip}
      options={{
        buttons: ['back', 'close', 'primary', 'skip'],
        showProgress: true,
        primaryColor: '#f97316',
        overlayColor: '#0f172a66',
        zIndex: 1200,
      }}
      locale={{
        back: 'Quay lai',
        close: 'Dong',
        last: 'Hoan tat',
        next: 'Tiep theo',
        skip: 'Bo qua',
      }}
      styles={{
        spotlight: {
          borderRadius: 14,
        },
      }}
    />
  );
};
