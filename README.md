# Como executar

- Faça a instalação das depedências Node e Hardhat
- Inicialize o processo do hardhat com o comando
```
$ npx hardhat node
```
- Agora crie a rede privada Hardhat no Metamask
- Em sequência faça o deploy do contrato para a rede e inicialize a aplicação front-end com os comandos
```
$ npx hardhat run --network localhost scripts/deploy.js
$ npm start
```