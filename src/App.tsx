import {Button, Col, Container, FloatingLabel, Form, Image, InputGroup, Row} from "react-bootstrap";
import React, {useCallback, useEffect, useId, useRef, useState} from "react";
import searchWorkerUrl from "./search.worker.tsx?worker&url";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faCompactDisc, faFileLines, faKey, faLock} from "@fortawesome/free-solid-svg-icons";
import useLocalStorage from "@reactutils/use-local-storage";
import {Readme} from "./components/Readme.tsx";
import {SearchWorkerEvent} from "./types/SearchWorker.types.tsx";
import {Timer} from "./components/Timer.tsx";
import {Result} from "./types/Result.types.tsx";
import {Mnemonic, UserWallet} from "@multiversx/sdk-wallet/out";
import {strChunk} from "./utils/strChunk.ts";
import {CopyToClipboard} from "./components/CopyToClipboard.tsx";
import mvxLogo from "./assets/images/multiversx-logo.svg";

export const App = () => {
    const [isWorking, setIsWorking] = useState(false)
    const [startTime, setStartTime] = useState<number>(Date.now())
    const workers = useRef<Worker[]>([])
    const countTests = useRef<number[]>([])
    const [totalTests, setTotalTests] = useState<number>(0)
    const [result, setResult] = useState<Result | null>(null)
    const [searchShard, setSearchShard] = useLocalStorage('searchShard', -1)
    const [searchPrefix, setSearchPrefix] = useLocalStorage('searchPrefix', '')
    const [searchContains, setSearchContains] = useLocalStorage('searchContains', '')
    const [searchSuffix, setSearchSuffix] = useLocalStorage('searchSuffix', '')
    const inputThreads = useId()
    const inputSearchShard = useId()
    const inputSearchPrefix = useId()
    const inputSearchSuffix = useId()
    const inputSearchContains = useId()
    const [maxThreads, setMaxThreads] = useState(0)
    const [threads, setThreads] = useLocalStorage('threads', 0)

    useEffect(() => {
        const maxCores = countCores()
        setMaxThreads(maxCores)

        if (threads == 0) {
            setThreads(maxCores)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const countCores = () => {
        let cores = 0

        try {
            cores = parseInt(navigator.hardwareConcurrency.toString(), 10)
        } catch (err) {
            console.error(err)
        }

        return cores ? cores : 3
    }

    const handleStartButton = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        if (isWorking) {
            stopWorkers()
        } else {
            startWorkers()
        }
    }

    const startWorkers = () => {
        setResult(null)
        setIsWorking(true)
        setStartTime(Date.now())
        setTotalTests(0)
        countTests.current = []
        workers.current = []

        for (let id = 0; id < threads; id++) {
            workers.current[id] = new Worker(searchWorkerUrl, {type: 'module'})
            workers.current[id].addEventListener('message', messageHandler)
            workers.current[id].postMessage({
                action: 'start',
                id: id,
                searchShard: searchShard,
                searchPrefix: searchPrefix,
                searchContains: searchContains,
                searchSuffix: searchSuffix,
            })
        }
    }

    const stopWorkers = () => {
        for (const worker of workers.current) {
            worker.terminate()
        }

        setIsWorking(false)
        workers.current = []
    }

    const messageHandler = (event: MessageEvent) => {
        const data: SearchWorkerEvent = event.data

        switch (data.event) {
            case 'success': {
                stopWorkers()

                const mnemonic = Mnemonic.fromString(data.mnemonic)
                const secretKey = mnemonic.deriveKey(data.index)
                const address = secretKey.generatePublicKey().toAddress()
                setResult({
                    mnemonic: mnemonic,
                    index: data.index,
                    secretKey: secretKey,
                    address: address,
                    shard: data.shard,
                })
                break
            }
            case 'count':
                countTests.current[data.id] = data.count ?? 0
                setTotalTests(countTests.current.reduce((count, value) => count + value, 0))
                break
            case 'error':
                console.error(data)
                break
        }
    }

    const inputTextFilter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const re = /^[a-z0-9]$/i

        if (e.key != 'Backspace' && e.key != 'Delete' && !re.test(e.key)) {
            e.preventDefault()
        }
    }

    const download = (content: string, type: string, filename: string) => {
        const blob = new Blob([content], {type})
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", filename)
        link.click()
    }

    const handleDownloadJson = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        if (result === null) {
            return
        }

        const password = prompt("Type a password to protect your keystore:")

        if (password === null) {
            return
        }

        if (password === "") {
            alert("Your password can't be empty")
            return
        }

        const confirmPassword = prompt("Confirm your password:")

        if (confirmPassword === null || confirmPassword !== password) {
            alert('Wrong password confirmation, try again')
            return
        }

        const userWallet = UserWallet.fromSecretKey({
            secretKey: result.secretKey,
            password,
        })

        download(JSON.stringify(userWallet.toJSON()), "application/json", `${result.address.bech32()}.json`)
    }

    const handleDownloadPem = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        if (result === null) {
            return
        }

        const nl = "\n"
        const key = btoa(result.secretKey.hex() + result.secretKey.generatePublicKey().hex())
        const chunks = strChunk(key, 64)
        const pem = `-----BEGIN PRIVATE KEY for ${result.address.bech32()}-----` + nl
            + chunks.join(nl) + nl
            + `-----END PRIVATE KEY for ${result.address.bech32()}-----`

        download(pem, "text/plain", `${result.address.bech32()}.pem`)
    }

    const handleDownloadText = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        if (result === null) {
            return
        }

        const nl = "\r\n"
        const text = "Address:" + nl
            + result.address + nl + nl
            + `Seed phrase:` + nl
            + result.mnemonic + nl + nl
            + `Shard: ${result.shard}` + nl
            + `Index: ${result.index}`

        download(text, "text/plain", `${result.address.bech32()}.txt`)
    }

    const countFormatting = useCallback((num: number) => num.toLocaleString(), [])

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col
                    xs={12} sm={12} md={11} lg={10} xl={8} xxl={6}
                    className="min-vh-100 d-flex flex-column justify-content-center"
                >
                    <h1 className="text-center">
                        Multivers<Image src={mvxLogo} fluid alt="X" className="align-super"/> Vanity Address
                    </h1>
                    <Row className="flex-grow-1 align-items-center">
                        <Col>
                            <Row className="align-items-center g-3 mb-3">
                                <Col xs={6} md={2}>
                                    <FloatingLabel
                                        label="Shard"
                                        controlId={inputSearchShard}
                                    >
                                        <Form.Select
                                            value={searchShard}
                                            disabled={isWorking}
                                            onChange={(e) => setSearchShard(parseInt(e.currentTarget.value))}
                                        >
                                            <option value={-1}>Any</option>
                                            <option value={0}>0</option>
                                            <option value={1}>1</option>
                                            <option value={2}>2</option>
                                        </Form.Select>
                                    </FloatingLabel>
                                </Col>
                                <Col>
                                    <FloatingLabel
                                        label="Prefix"
                                        controlId={inputSearchPrefix}
                                    >
                                        <Form.Control
                                            type="text"
                                            value={searchPrefix}
                                            disabled={isWorking}
                                            placeholder=""
                                            maxLength={16}
                                            onChange={(e) => setSearchPrefix(e.currentTarget.value)}
                                            onKeyDown={inputTextFilter}
                                        />
                                    </FloatingLabel>
                                </Col>
                                <div className="w-100 d-block d-md-none m-0"></div>
                                <Col>
                                    <FloatingLabel
                                        label="Contains"
                                        controlId={inputSearchContains}
                                    >
                                        <Form.Control
                                            type="text"
                                            value={searchContains}
                                            disabled={isWorking}
                                            placeholder=""
                                            maxLength={16}
                                            onChange={(e) => setSearchContains(e.currentTarget.value)}
                                            onKeyDown={inputTextFilter}
                                        />
                                    </FloatingLabel>
                                </Col>
                                <Col>
                                    <FloatingLabel
                                        label="Suffix"
                                        controlId={inputSearchSuffix}
                                    >
                                        <Form.Control
                                            type="text"
                                            value={searchSuffix}
                                            disabled={isWorking}
                                            placeholder=""
                                            maxLength={16}
                                            onChange={(e) => setSearchSuffix(e.currentTarget.value)}
                                            onKeyDown={inputTextFilter}
                                        />
                                    </FloatingLabel>
                                </Col>
                            </Row>
                            <Row className="align-items-center g-3 mb-3">
                                <Col xs={12} md={4} className="align-self-stretch">
                                    <Button
                                        variant={isWorking ? "outline-secondary" : "secondary"}
                                        onClick={handleStartButton}
                                        size="lg"
                                        className="w-100 h-100"
                                    >
                                        {isWorking ? "STOP" : "START"}
                                    </Button>
                                </Col>
                                <Col xs={3} sm={2}>
                                    <FloatingLabel
                                        label="Threads"
                                        controlId={inputThreads}
                                    >
                                        <Form.Select
                                            value={threads}
                                            disabled={isWorking}
                                            onChange={(e) => setThreads(parseInt(e.currentTarget.value))}
                                        >
                                            {Array.from({length: maxThreads}).map((_e, index) => {
                                                return <option key={index} value={index + 1}>{index + 1}</option>
                                            })}
                                        </Form.Select>
                                    </FloatingLabel>
                                </Col>
                                <Col className="py-0">
                                    <div>
                                        Timer: <Timer timestamp={startTime} start={isWorking}/>
                                    </div>
                                    <div>
                                        Wallets tested: {totalTests == 0 && isWorking
                                        ? "warming up"
                                        : countFormatting(totalTests)}
                                    </div>
                                </Col>
                                <Col xs={"auto"} className="text-secondary text-end">
                                    {result
                                        ? <FontAwesomeIcon
                                            icon={faCheck}
                                            size={"2xl"}
                                            className="text-success"
                                        />
                                        : <FontAwesomeIcon
                                            icon={faCompactDisc}
                                            size={"2xl"}
                                            spin={isWorking}
                                            beat={isWorking}
                                        />
                                    }
                                </Col>
                            </Row>
                            <div className="mb-3">
                                <hr/>
                                <Row className="justify-content-center mb-3">
                                    <Col xs={{span: 12, order: 1}} sm={{span: 10, order: 1}}>
                                        <Form.Group className="mb-3" controlId="wallet.address">
                                            <Form.Label>Wallet address</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="text"
                                                    readOnly={true}
                                                    value={result ? result.address.bech32() : ""}
                                                    className="border-end-0"
                                                />
                                                <InputGroup.Text className="border-start-0">
                                                <span className={result ? "visible" : "invisible"}>
                                                    <CopyToClipboard text={result ? result.address.bech32() : ""}/>
                                                </span>
                                                </InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 4, order: 3}} sm={{span: 2, order: 2}}>
                                        <Form.Group className="mb-3" controlId="wallet.shard">
                                            <Form.Label>Shard</Form.Label>
                                            <Form.Control
                                                type="text"
                                                readOnly={true}
                                                value={result ? result.shard : ""}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 12, order: 2}} sm={{span: 10, order: 3}}>
                                        <Form.Group className="mb-3" controlId="wallet.mnemonic">
                                            <Form.Label>Seed phrase</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    as="textarea"
                                                    readOnly={true}
                                                    value={result ? result.mnemonic.toString() : ""}
                                                    className="border-end-0"
                                                />
                                                <InputGroup.Text className="border-start-0">
                                                <span className={result ? "visible" : "invisible"}>
                                                    <CopyToClipboard text={result ? result.mnemonic.toString() : ""}/>
                                                </span>
                                                </InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={{span: 4, order: 4}} sm={{span: 2, order: 4}}>
                                        <Form.Group className="mb-3" controlId="wallet.index">
                                            <Form.Label>Index</Form.Label>
                                            <Form.Control
                                                type="text"
                                                readOnly={true}
                                                value={result ? result.index : ""}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="justify-content-center g-3">
                                    <Col xs={"auto"}>
                                        <Button
                                            as="a"
                                            variant="outline-info"
                                            href={"#"}
                                            onClick={handleDownloadJson}
                                            disabled={result === null}
                                        >
                                            <FontAwesomeIcon icon={faLock}/>
                                            <span className="d-none d-sm-inline">Download as</span> JSON
                                        </Button>
                                    </Col>
                                    <Col xs={"auto"}>
                                        <Button
                                            as="a"
                                            variant="outline-info"
                                            href={"#"}
                                            onClick={handleDownloadPem}
                                            disabled={result === null}
                                        >
                                            <FontAwesomeIcon icon={faKey}/>
                                            <span className="d-none d-sm-inline">Download as</span> PEM
                                        </Button>
                                    </Col>
                                    <Col xs={"auto"}>
                                        <Button
                                            as="a"
                                            variant="outline-info"
                                            href={"#"}
                                            onClick={handleDownloadText}
                                            disabled={result === null}
                                        >
                                            <FontAwesomeIcon icon={faFileLines}/>
                                            <span className="d-none d-sm-inline">Download as</span> TXT
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    <div className="text-center small text-muted pb-2 justify-se">
                        <Row className="justify-content-between align-items-center">
                            <Col xs="auto">
                                <Readme/>
                            </Col>
                            <Col xs="auto">
                                Made by <a href="https://x.com/grobux" target="_blank">Bubu</a>
                                &nbsp;|&nbsp;
                                <a href="https://x.com/ProjectX_DAO">
                                    #FollowTheX
                                </a>
                                &nbsp;|&nbsp;
                                <a href="https://github.com/grobux/mvx-vanity-address">
                                    GitHub
                                </a>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export default App
