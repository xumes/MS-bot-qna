const builder = require('botbuilder')
const restify = require('restify')
const cognitiveservices = require('botbuilder-cognitiveservices')

//Configura o servidor Restify
const server = restify.createServer()
server.listen(process.env.port || process.env.port || 3978, () => {
    console.log(`O servidor ${server.name} está rodando em ${server.url}`)
})

//Configura o chat connector para se comunicar com o Bot Framework Service da Microsoft
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
})

//Endpoint que irá monitorar as mensagens do usuário
server.post('/api/messages', connector.listen())

const bot = new builder.UniversalBot(connector)

var recognizer = new cognitiveservices.QnAMakerRecognizer({
	knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
	subscriptionKey: process.env.SUBSCRIPTION_KEY_ID
});

var basicQnaMakerDialog = new cognitiveservices.QnAMakerDialog({
	recognizers: [recognizer],
	defaultMessage: "Ops, alguma coisa aconteceu",
	qnaThreshold: 0.3
});

bot.dialog('/', basicQnaMakerDialog);