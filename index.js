const builder = require('botbuilder')
const restify = require('restify')
const cognitiveServices = require('botbuilder-cognitiveservices')
require('dotenv').config()

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
const bot = new builder.UniversalBot(connector)
bot.set('storage', new builder.MemoryBotStorage())
server.post('/api/messages', connector.listen())

console.log(process.env.KNOWLEDGE_BASE_ID)
console.log(process.env.SUBSCRIPTION_KEY_ID)

var recognizer = new cognitiveServices.QnAMakerRecognizer({
	knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
    subscriptionKey: process.env.SUBSCRIPTION_KEY_ID,
    top: 3
});

const qnaMakerTools = new cognitiveServices.QnAMakerTools()
bot.library(qnaMakerTools.createLibrary())

const basicQnaMakerDialog = new cognitiveServices.QnAMakerDialog({
  recognizers: [recognizer],
  defaultMessage: 'Não encontrado! Tente alterar os termos da pergunta!',
  qnaThreshold: 0.5,
  feedbackLib: qnaMakerTools
})

basicQnaMakerDialog.respondFromQnAMakerResult = (session, qnaMakerResult) => {
    const firstAnswer = qnaMakerResult.answers[0].answer
    const composedAnswer = firstAnswer.split(';')
    if (composedAnswer.length === 1) {
    return session.send(firstAnswer)
    }
    const [title, description, url, image] = composedAnswer
    const card = new builder.HeroCard(session)
        .title(title)
        .text(description)
        .images([builder.CardImage.create(session, image.trim())])
        .buttons([builder.CardAction.openUrl(session, url.trim(), 'Comprar agora')])
    const reply = new builder.Message(session).addAttachment(card)
    session.send(reply)
}

bot.dialog('/', basicQnaMakerDialog)