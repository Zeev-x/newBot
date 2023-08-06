const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const data = require('./data/conf_data_bot.json');
const bot = new Telegraf(data.token);
const ownerId = data.id;

let isBotActive = true;

async function sendAnime(ctx, animeName) {
  if (!isBotActive) return;
  const url = `https://lilyane.cyclic.app/api/${animeName}`;
  ctx.reply('Tunngu sebentar permintaanmu sedang di proses...');
  try {
    const { data } = await axios.get(url);
    console.log(data.status);

    if (data.status === true) {
      const imageUrl = data.url;
      bot.telegram.sendPhoto(ctx.chat.id, { url: imageUrl },{caption:data.name});
    } else {
      bot.telegram.sendMessage(ctx.chat.id, `Tidak dapat menemukan gambar ${animeName}.`);
    }
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
    bot.telegram.sendMessage(ctx.chat.id, `Terjadi kesalahan saat mengambil data atau mengirim gambar ${animeName}.`);
  }
}

const keyboard = Markup.keyboard([
    ['/help'],
    ['/gempa'],
    ['/waifu'],
    ['/angela'],
    ['/ayaka'], 
    ['/bocchi'],
    ['/bunny'], 
    ['/ganyu'],
    ['/ghost'],
    ['/nahida'],
    ['/osakana'],
    ['/keyoff']
  ]).resize();


bot.on('new_chat_members', (ctx) => {
  const newMember = ctx.message.new_chat_members[0];
  const nameMember = newMember.first_name;
  const groupName = ctx.chat.title;
  ctx.reply(`Selamat datang, ${nameMember}! Selamat bergabung di grup ${groupName}.`);
});

bot.on('left_chat_member', (ctx) => {
  const userOut = ctx.message.left_chat_member;
  const nameUser = userOut.first_name;
  const groupName = ctx.chat.title;
  ctx.reply(`Selamat tinggal, ${nameUser}! Semoga harimu menyenangkan di grup ${groupName}.`);
});

bot.start((ctx) => {
  if(!isBotActive) return;
  const namaPengguna = ctx.from.first_name;
  const pesanPercakapan = `
Halo ${namaPengguna}!

Selamat datang di bot Telegram kami. Terima kasih telah bergabung!

Anda dapat menggunakan perintah berikut:
/start - Memulai percakapan
/help - Menampilkan bantuan dan perintah yang tersedia
`;
  ctx.reply(pesanPercakapan,keyboard);
});

bot.command('menu', async(ctx) => {
  if(!isBotActive) return;
  var mess = 'Silahakn send /help untuk melihat perintah apa saja yang bisa di lakukan bot.';
  ctx.reply(mess);
});


bot.help((ctx) => {
  if(!isBotActive) return;
  var mess = `List command
  
• Nsfw command
•> send /waifu -> untuk mengambil gambar ai nsfw
•> send /angela -> untuk mengambil gambar cosplay angela nsfw
•> send /ayaka -> untuk mengambil gambar cosplay ayaka nsfw
•> send /bocchi -> untuk mengambil gambar cosplay bocchi nsfw
•> send /bunny -> untuk mengambil gambar cosplay bunny nsfw
•> send /ganyu -> untuk mengambil gambar cosplay ganyu nsfw
•> send /ghost -> untuk mengambil gambar cosplay ghost blade nsfw
•> send /nahida -> untuk mengambil gambar cosplay nahida nsfw
•> send /osakana -> untuk mengambil gambar cosplay osakana nsfw

• Anime search command
•> send /chara [name character] -> utuk mengambil gambar anime sesuai query kamu

• News command
•> send /gempa -> untuk mendapatkan informasi gempa terkini

• Download command
•> send /ytmp3 [link yt] -> untuk mendownload audio dari youtube

• Owner command
•> send /bot [on/off] -> untuk menghidupkan dan mematikan bot

• Other command
•> send /status -> untuk melihat status bot online atau offline
•> send /keyoff -> untuk menonaktifkan keyboard perintah
•> send /keyon -> untuk mengaktifkan keyboard perintah
`;
  ctx.reply(mess);
});

// Menangani perintah anime
bot.command('waifu', async (ctx) => {
  await sendAnime(ctx, 'ai-waifu');
});

bot.command('angela', async (ctx) => {
  await sendAnime(ctx, 'angela');
});

bot.command('ayaka', async (ctx) => {
  await sendAnime(ctx, 'ayaka');
});

bot.command('bocchi', async (ctx) => {
  await sendAnime(ctx, 'bocchi');
});

bot.command('bunny', async (ctx) => {
  await sendAnime(ctx, 'bunny');
});

bot.command('ganyu', async (ctx) => {
  await sendAnime(ctx, 'ganyu');
});

bot.command('ghost', async (ctx) => {
  await sendAnime(ctx, 'ghost');
});

bot.command('nahida', async (ctx) => {
  await sendAnime(ctx, 'nahida');
});

bot.command('osakana', async (ctx) => {
  await sendAnime(ctx, 'osakana');
});

bot.command("gempa", async (ctx) => {
  if (!isBotActive) return;
  const url = "https://lilyane.cyclic.app/api/gempa";

  try {
    const { data } = await axios.get(url);
    const waktu = data.waktu;
    const lintang = data.lintang;
    const bujur = data.bujur;
    const magnitudo = data.magnitudo;
    const kedalaman = data.kedalaman;
    const wilayah = data.wilayah;
    const map = data.map;
    const message = `Info Gempa Terkini\n\nWaktu : ${waktu}\nLintang : ${lintang}\nBujur : ${bujur}\nMagnitudo : ${magnitudo}\nKedalaman : ${kedalaman}\nWilayah : ${wilayah}`;

    bot.telegram.sendPhoto(ctx.chat.id, { url: map }, { caption: message });
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
    bot.telegram.sendMessage(ctx.chat.id, 'Terjadi kesalahan saat mengambil data atau mengirim info gempa.');
  }
});

bot.command('ytmp3', async (ctx) => {
  if(!isBotActive) return;
  const message = ctx.message.text;
  const youtubeUrl = message.split(' ')[1];
  ctx.reply('Permintaanmu sedang di proses...')
  if (ytdl.validateURL(youtubeUrl)) {
    try {
      const audioInfo = await ytdl.getInfo(youtubeUrl);
      const audioTitle = audioInfo.videoDetails.title;
      const audioStream = ytdl(youtubeUrl, { filter: 'audioonly' });
      await ctx.replyWithAudio({ source: audioStream, filename: audioTitle });
    } catch (error) {
      ctx.reply('Gagal mengunduh audio dari URL YouTube.');
    }
  } else {
    ctx.reply('Kirimkan perintah /audio dan URL YouTube yang valid.');
  }
});

bot.command('bot', async (ctx) => {
  const message = ctx.message.text;
  const query = message.split(' ')[1];
  const owner = ctx.message.from.id === ownerId;

  if (!owner) return ctx.reply('Anda tidak memiliki izin untuk menggunakan perintah ini.');
  if (!query) return ctx.reply('Masukkan parameter off/on/status setelah perintah /bot');

  if (query === 'on' && !isBotActive) {
    isBotActive = true;
    ctx.reply('Bot telah aktif');
  } else if (query === 'off' && isBotActive) {
    isBotActive = false;
    ctx.reply('Bot nonaktif');
  } else if (query === 'status') {
    const mess = isBotActive ? 'online' : 'offline';
    ctx.reply('Status bot: ' + mess);
  } else {
    ctx.reply('Bot sudah dalam mode ' + query);
  }
});

bot.command('status', async (ctx) => {
  const stat = isBotActive ? 'online' : 'offline';
  const messon = 'Bot online, silahkan kirim perintah!!';
  const messoff = 'Bot offline, semua perintah akan ditolak!!';
  if (stat === 'online') {
    ctx.reply(messon);
  } else {
    ctx.reply(messoff);
  }
});

bot.command('chara', async (ctx) => {
  if (!isBotActive) return;
  const text = ctx.message.text;
  const query = text.split('/chara')[1].trim();
  const url = `https://lilyane.cyclic.app/api/animeimg?q=${query}`;
  if (!query) return ctx.reply('Masukan Query!!!')

  try {
    const response = await axios.get(url);
    const { data } = response;
    console.log(data.status);

    if (data.status === true) {
      bot.telegram.sendPhoto(ctx.chat.id, {url : data.url}, {caption:query});
    } else {
      bot.telegram.sendMessage(ctx.chat.id, 'Tidak dapat menemukan gambar karakter anime.');
    }
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
    bot.telegram.sendMessage(ctx.chat.id, 'Terjadi kesalahan saat mengambil data.');
  }
});

bot.command('keyoff', async(ctx) => {
  if (!isBotActive) return;
  ctx.reply('Keyboard telah dinonaktifkan', Markup.removeKeyboard());
});

bot.command('keyon', (ctx) => {
  if (!isBotActive) return;
  const text = 'Keyboard telah di aktifkan';
  ctx.reply(text, keyboard);
});


bot.command('api', (ctx) => {
  const text = 'Click tombol untuk masuk ke web api :';
  const linkApi = {
    inline_keyboard: [
      [
        {
          text: 'Open Link',
          url: 'https://lilyane.cyclic.app'
        }
      ]
    ]
  };

  // Sending the message with inline keyboard
  ctx.reply(text, {
    reply_markup: JSON.stringify(linkApi)
  });
});
bot.on('callback_query', (ctx) => {
  ctx.answerCbQuery();
});


/*bot.command('txt', (ctx) => {
  const userId = ctx.from.id;
  const namex = new Date().getTime();
  const fileName = `zeev_${namex}.html`;
  const fileContent = ctx.message.text.replace('/txt ', '');

  fs.writeFile(fileName, fileContent, (err) => {
    if (err) {
      ctx.reply('Terjadi kesalahan saat membuat file.');
    } else {
      ctx.replyWithDocument({ source: fileName }, { caption: 'Ini adalah file Anda.' });
    }
  });
});*/

//hidden command
bot.command('getid', (ctx) => {
  const id = ctx.message.from.id;
  ctx.reply('Your id is : ' + id);
});

bot.command('stop', (ctx) => {
  // Cek apakah pengguna adalah owner bot
  if (ctx.message.from.id === ownerId) {
    ctx.reply('Bot akan dihentikan dari konsol.');
    stopBotGracefully();
  } else {
    ctx.reply('Anda tidak memiliki izin untuk menggunakan perintah ini.');
  }
});

bot.on('message', (ctx) => {
  var dis = 'User send : ' + ctx.message.text;
  console.log(dis);
});

function stopBotGracefully() {
  bot.stop(() => {
    console.log('Bot telah dihentikan dari konsol.');
    process.exit();
  });
}

bot.launch();