# FRONTEND 

## Dev notes

Download VSCode
- https://code.visualstudio.com/

Install extensions:
- [Eslint (Microsoft)](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier (Prettier)](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ZipFS (Arcanis)](https://marketplace.visualstudio.com/items?itemName=arcanis.vscode-zipfs)
- [Styled Componets (Styled Components)](https://marketplace.visualstudio.com/items?itemName=styled-components.vscode-styled-components)
- [Git Graph (mhutchie) - Optional](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph)

Checkout Frontend Repo:
- https://github.com/envault-io/frontend

Create .env file in root with this contents for an alternated hosted backend server
```
APP_HOST=https://localhost
APP_PORT=4000
API_HOST=https://api.dev.envault.io
API_PORT=443
VITE_WINDY_API_KEY={windyAPIKey}
```

run:
```bash
npm i -g yarn
npm i -g vite
```
then:
```bash
yarn install
```
now everything is ready, you can run:
```bash
yarn serve
```

if prettier / eslint isn't working:
```bash
yarn dlx @yarnpkg/sdks vscode
```
(this activates the webserver, first compile takes about 4 seconds then changes should be picked up on the fly)

available at (host).localhost:4000
i.e. https://demo.localhost:4000

accept all the cert errors, or alternatively install the webpack cert in trust store. We need https for HTTP2.