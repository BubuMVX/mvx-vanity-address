# MultiversX Vanity Address Generator

## Purpose

This tool helps you generate a MultiversX wallet according to the criterias your provide.
It works by randomly generating seed phrases and checking if the associated wallets match your settings.

## Security

This tool is fully executed inside your browser and doesn't transmit anything outside of it.
You can disconnect from the Internet once the app is loaded.

You can read, copy, modify, compile and execute the source code provided here on an offiline device for maximum
security.

## Usage

You can set these settings:

- `Threads`: the number of CPU threads used for the calculations. The more, the faster. Limited by the number of CPU
  cores your computer has.
- `Shard`: the shard you want for your wallet.
- `Prefix` / `Contains` / `Suffix`: search for a specific string at the beginning, anywhere, or at the end of your wallet address.

Please note that a wallet address contains alphanumeric characters excluding 1, b, i, and o.

## Output

Once a match is found, you can copy your wallet's details or download your key in various formats:

- `JSON`: a keystore protected with a password. With a strong password, you can almost store it as it is.
- `PEM`: a raw private key, without any protection. Be careful how you store it.
- `Text`: a simple text file with all the details displayed. Be careful how you store it.

## How to run this app?

### Online

Visit https://wallet.artmakers.io/

### Offline

```
git clone https://github.com/grobux/mvx-vanity-address
cd mvx-vanity-address
npm install
npm run dev
```
