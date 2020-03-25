
// example bot
import botkit from 'botkit';

require('dotenv').config(); // load environment variables

// botkit controller
const controller = botkit.slackbot({
  debug: false,
});

let users = [];
let dmContact;

// initialize slackbot
const slackbot = controller.spawn({
  token: process.env.WHISPERBOT_TOKEN,
}).startRTM((err, bot, payload) => {
  if (err) { throw new Error(err); }
  users = payload.users;
});

// prepare webhook
controller.setupWebserver(process.env.PORT || 3001, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, slackbot, () => {
    if (err) { throw new Error(err); }
  });
});

controller.hears(['hello', 'hi', 'howdy', 'hey'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `Hello, ${res.user.name}!`);
    } else {
      bot.reply(message, 'Hello there!');
    }
  });
});

controller.hears(['help hours', 'office hours', 'ta hours', 'TA hours', 'homework hours'], ['direct_message'], (bot, message) => {
  const d = new Date();
  let reply = '';
  switch (d.getDay()) {
    case 0:
      reply = '2-4 Adam - Unity, git and gitflow, music software (Ableton Live and Sibelius)\n'
      + '4-6 Kyle - git, js, frontend, bash, and data science (python, r)\n'
      + '6-8 Alexis - illustrator, photoshop, sketch, design thinking, crosswords\n'
      + '8-10 - Ben Packer web, data';
      break;
    case 1:
      reply = '6-7 Jason - Web, react, python, flask, django, db, git, terminal\n'
      + '7-8 Kathy Illustrator, Photoshop, UI/UX, wireframing\n'
      + '8-9 Lillian Photoshop, Sketch, Indesign, Flash, Illustrator (Basic)\n'
      + '9-10 Robin node, frontend, Van Emde Boas trees';
      break;
    case 2:
      reply = '5-6:30 Abby - web, js, React Native, Aftereffects, Illustrator, some Premier Pro\n'
      + '7-8 Pat iOS, terminal, git, Unity, 3D printing, techincal interviews\n'
      + '8-9 John iOS: Swift and Objective-C, Xcode, Parse server, git, C, bash, React-Native, Java\n'
      + '9-10 Juan Autopano Video, Illustrator, Photoshop, Sketch, Maya';
      break;
    case 3:
      reply = '8-10 Jenny - Adobe Photoshop, Illustrator, AfterEffects, Maya, Design Thinking, hugs, playing games\n'
      + '9-10 John - iOS: Swit and Objective-C, Xcode, Parse server, git, C, bash, React-Native, Java';
      break;
    case 4:
      reply = '5-6 Lillian - Photoshop, Sketch, Indesign, Flash, Illustrator (Basic)\n'
      + '6-7 Jason - Web, react, python, flask, django, db, git, terminal\n'
      + '7-9 Sidney - web, js, node.js, react/redux, flask, git, bash\n'
      + '9-10 Kathy - Illustrator, Photoshop, UI/UX, wireframing';
      break;
    case 5:
      reply = '3-4 Tyler - C#, Visual Studio, backend, iOS, system applications, git, bash, C++'
      + '4:30-6:30 Luisa - Photoshop, Sketch, Maya, Design Thinking, all things web-styling';
      break;
    case 6:
      reply = '6-8 Armin - iOS, Swift, Android Studio, (some) Unity, UI/UX';
      break;
    default:
      reply = 'Uh oh, looks like an error occurred. I can\'t get the office hour schedule for some reason.';
  }
  bot.reply(message, `Office hours today:\n${reply}`);
});

controller.hears(['help'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Message me with the word \'post\' and I\'ll post anonymously in a channel for you :zipper_mouth_face:\nUse the word \'message\', and I\'ll message someone anonymously :scream:\nYou can also ask whose TA hours/office hours are in the lab today, and when! :100:\n(Side Note: If posting to some channel doesn\'t work, I probably just need to be invited to the channel first!)');
});

controller.hears(['post'], ['direct_message'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    convo.ask('Sure! Where do you want to post? (Use a # symbol!)', (response, conversation) => {
      const channelID = response.text.substring(2, 13);
      const channelName = response.text.substring(14, response.text.length - 1);

      convo.next();
      convo.ask(`Okay! What do you want to post to #${channelName} ?`, (resp, conv) => {
        if (resp.subtype === 'file_share') {
          bot.say({
            text: resp.file.url_private,
            channel: channelID,
          });
          convo.say(`Okay, I just posted your image to #${channelName}!`);
          convo.next();
        } else {
          bot.say({
            text: resp.text,
            channel: channelID,
          });
          convo.say(`Okay, I just posted: \n${resp.text}\nto #${channelName}!`);
          convo.next();
        }
      });
    });
  });
});

controller.hears(['message'], ['direct_message'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    convo.next();
    convo.ask('Sure! Who do you want to message? (Be sure to use the @ symbol!)', (response, conversation) => {
      users.forEach((user) => {
        if (user.id === response.text.substring(2, 11)) {
          dmContact = user;
        }
      });
      convo.next();
      convo.ask(`Okay! What do you want to say to @${dmContact.name}?`, (resp, conv) => {
        bot.say({
          text: resp.text,
          channel: dmContact.id,
        });
        convo.say(`Okay, I just messaged:\n${resp.text}\nto @${dmContact.name}!`);
        convo.next();
      });
    });
  });
});

controller.on('direct_message', (bot, message) => {
  bot.reply(message, 'What? I didn\'t understand that...\nSay \'help\' if you need it--I\'ll teach you how to make me post for you!');
});

controller.on('direct_mention', (bot, message) => {});

controller.on('mention', (bot, message) => {});

controller.on('direct_message', (bot, message) => {
  bot.reply(message, 'What? I didn\'t understand that...');
});
console.log('starting bot');
