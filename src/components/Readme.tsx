import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Alert, Button, Col, Modal, Row } from 'react-bootstrap';
import { Url } from '../config.tsx';


export const Readme = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button
                size={'sm'}
                variant={'outline-secondary'}
                onClick={handleShow}
            >
                Read more
            </Button>
            <Modal
                show={show}
                onHide={handleClose}
                size={'lg'}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>README.txt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h3>
                        Purpose
                    </h3>
                    <p>
                        This tool helps you generate a MultiversX wallet according to the criterias your provide.<br />
                        It works by randomly generating seed phrases and checking if the associated wallets match your
                        settings.
                    </p>
                    <h3>
                        Security
                    </h3>
                    <p>
                        This tool is fully executed inside your browser and doesn't transmit anything outside of it.
                        You can disconnect from the Internet once the app is loaded.
                    </p>
                    <p>
                        You can read, copy, modify, compile and execute the full <a
                        href={Url.GitHub}
                        target={'_blank'}
                    >
                        open source code on GitHub
                    </a>.
                    </p>
                    <h3>
                        Usage
                    </h3>
                    <Alert variant={'info'}>
                        <FontAwesomeIcon icon={faCircleInfo} size={'xs'} className={'me-2'} />
                        A wallet address contains alphanumeric characters <strong>excluding 1, b, i, and o</strong>.
                    </Alert>
                    <p>You can set these settings:</p>
                    <ul>
                        <li>
                            <strong>Threads</strong>: the number of CPU threads used for the calculations. The more, the
                            faster. Limited by the number of CPU cores your computer has.
                        </li>
                        <li>
                            <strong>Shard</strong>: the shard you want for your wallet.
                        </li>
                        <li>
                            <strong>Prefix / Contains / Suffix</strong>: search for a specific string at the beginning,
                            anywhere, or at the end of your wallet address.
                        </li>
                    </ul>
                    <h3>
                        Output
                    </h3>
                    <p>
                        Once a match is found, you can copy your wallet's details or download your key in various
                        formats:
                    </p>
                    <ul>
                        <li>
                            <strong>JSON</strong>:
                            a keystore protected with a password. With a strong password, you can almost store it
                            as it is.
                        </li>
                        <li>
                            <strong>PEM</strong>:
                            a raw private key, without any protection. Be careful how you store it.
                        </li>
                        <li>
                            <strong>Text</strong>:
                            a simple text file with all the details displayed. Be careful how you store it.
                        </li>
                    </ul>
                    <h3>
                        Links
                    </h3>
                    <Row className={'g-2 justify-content-center'}>
                        <Col xs={'auto'}>
                            <Button
                                as={'a'}
                                variant={'secondary'}
                                href={Url.GitHub}
                            >
                                My Twitter
                            </Button>
                        </Col>
                        <Col xs={'auto'}>
                            <Button
                                as={'a'}
                                variant={'secondary'}
                                href={Url.ProjectX}
                            >
                                Project X
                            </Button>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </>
    );
};
