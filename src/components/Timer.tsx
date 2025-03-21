import { PropsWithoutRef, useEffect, useRef } from 'react';
import Countdown, { CountdownApi, CountdownRenderProps, zeroPad } from 'react-countdown';

type TimerProps = {
    timestamp: number,
    start: boolean,
}

export const Timer = (
    {
        timestamp,
        start,
    }: PropsWithoutRef<TimerProps>,
) => {
    useEffect(() => {
        if (countdownRef.current == null) {
            return;
        }

        if (start) {
            countdownRef.current.start();
        } else {
            countdownRef.current.pause();
        }
    }, [start]);

    const countdownRef = useRef<CountdownApi | null>(null);
    const renderer = ({ hours, minutes, seconds }: CountdownRenderProps) => (
        <span>
            {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
        </span>
    );
    const setRef = (countdown: Countdown | null): void => {
        if (countdown) {
            countdownRef.current = countdown.getApi();
        }
    };

    return <Countdown
        ref={setRef}
        date={timestamp}
        renderer={renderer}
        overtime={true}
        autoStart={false}
    />;
};
