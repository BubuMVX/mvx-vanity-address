import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { copy } from '@stianlarsen/copy-to-clipboard';
import { PropsWithoutRef, useState } from 'react';
import { Button } from 'react-bootstrap';

type CopyToClipboardProps = {
    text: string,
}

export const CopyToClipboard = (
    {
        text,
    }: PropsWithoutRef<CopyToClipboardProps>,
) => {
    const [copied, setCopied] = useState(false);
    const onCopy = () => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <Button onClick={() => copy(text, onCopy)} variant={'outline-info'} size={'sm'} className={'border-0'}>
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
        </Button>
    );
};
