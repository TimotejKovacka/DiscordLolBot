const Discord = require("discord.js");
const fetch = require("node-fetch");
const config = require("./config.json");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const apiKey = "RGAPI-153ff792-780a-46a6-aaa2-8116da9d896a";
//RGAPI-153ff792-780a-46a6-aaa2-8116da9d896a  api_key
//5VGBHEo7kFjSKCsfJ4DKj5gfJJwxZCm__oGZnpdh7HFY1yUNb5sLHl-Y1u7hLrxs55nkAUpkmE3Cbg    puuid
//EWah6YIyItwxkE6mju85nDXX2x-On6CtB6lg9fOiHd6hWhM
//EUN1_3052244429

const polskyVodici = {
    '335381586562252802': "Ryba v silonkach",
}

let versions = [];
let champions = [];
async function fetchSumByName(name) {
    const link = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${apiKey}`;
    const response = await fetch(link);
    let data = await response.json();
    return data;
}

async function fetchCurrMatch(encID) {
    const link = `https://eun1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${encID}?api_key=${apiKey}`;
    const response = await fetch(link);
    let data = await response.json();
    return data;
}

function findChamp(key) {
    for (const champ in champions) {
        const nkey = parseInt(champions[`${champ}`]['key']);
        if (nkey == key) {
            return champions[`${champ}`]['id'];
        }
    }
}

const prefix = "!>";
client.on("messageCreate", function(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    if (command === "g") {
        let summonerName = "";
        if (!args.length && message.author['id'] in polskyVodici) {
            summonerName = polskyVodici[message.author['id']];
        } else if (!args.length && !(message.author['id'] in polskyVodici)) {
            message.reply(`You are not a polsky vodic please provide summoner name`);
            return;
        } else {
            summonerName = args.join('%20');
        }
        fetchSumByName(summonerName).then(sumdata => {
            fetchCurrMatch(sumdata['id']).then(matchData => {
                Promise.all([
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][0]['summonerId']}?api_key=${apiKey}`),
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][1]['summonerId']}?api_key=${apiKey}`),
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][2]['summonerId']}?api_key=${apiKey}`),
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][3]['summonerId']}?api_key=${apiKey}`),
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][4]['summonerId']}?api_key=${apiKey}`),
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][5]['summonerId']}?api_key=${apiKey}`),
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][6]['summonerId']}?api_key=${apiKey}`),
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][7]['summonerId']}?api_key=${apiKey}`),
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][8]['summonerId']}?api_key=${apiKey}`),
                    fetch(`https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchData['participants'][9]['summonerId']}?api_key=${apiKey}`),
                ]).then(responses => {
                    Promise.all(responses.map( response => response.json() )).then( ranks => {
                        let sranks = ranks.map( rank => {
                            if (!rank.length) return "Unranked";
                            present = false;
                            for (i = 0; i < rank.length; i++){
                                if (rank[i]['queueType'] === 'RANKED_SOLO_5x5') return [`${rank[i]['tier'].charAt(0)+rank[i]['tier'].slice(1).toLowerCase()} ${rank[i]['rank']}`];
                            }
                            return "Unranked";
                        });
                        let champs = matchData['participants'].map( participant => {
                            const champID = participant['championId'];
                            return findChamp(champID);
                        })
                        const time = matchData['gameLength'];
                        const minutes = Math.floor(time/60);
                        const seconds = time - minutes*60;
                        const exampleEmbed = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(matchData['gameMode'] === "CLASSIC" ? "Normal" : `${matchData['gameMode'].charAt(0)}${matchData['gameMode'].slice(1).toLowerCase()}  u.gg link`)
                            .setURL(`https://u.gg/lol/profile/eun1/${summonerName}/live-game`)
                            .setAuthor({ name: "Korgis", iconURL: "https://timotejkovacka.com/images/Picture6.png", url: "https://www.timotejkovacka.com"})
                            .setDescription('Game Length: '+ minutes + "minutes " + seconds + "seconds")
                            .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/${versions[0]}/img/profileicon/${sumdata['profileIconId']}.png`)
                            .addFields(
                                //{ name: 'Regular field title', value: 'Some value here' },
                                //{ name: '\u200B', value: '\u200B' },
                                { name: 'Summoner', value: `[${matchData['participants'][0]['summonerName']}](https://u.gg/lol/profile/eun1/${matchData['participants'][0]['summonerName']}/overview)
                                ${matchData['participants'][1]['summonerName']}
                                ${matchData['participants'][2]['summonerName']}
                                ${matchData['participants'][3]['summonerName']}
                                ${matchData['participants'][4]['summonerName']}`, inline: true },
                                { name: 'Champion', value: `${champs[0]}
                                ${champs[1]}
                                ${champs[2]}
                                ${champs[3]}
                                ${champs[4]}`, inline: true },
                                { name: 'Rank', value: `${sranks[0]}
                                ${sranks[1]}
                                ${sranks[2]}
                                ${sranks[3]}
                                ${sranks[4]}`, inline: true },
                                { name: 'Summoner', value: `${matchData['participants'][5]['summonerName']}
                                ${matchData['participants'][6]['summonerName']}
                                ${matchData['participants'][7]['summonerName']}
                                ${matchData['participants'][8]['summonerName']}
                                ${matchData['participants'][9]['summonerName']}`, inline: true },
                                { name: 'Champion', value: `${champs[5]}
                                ${champs[6]}
                                ${champs[7]}
                                ${champs[8]}
                                ${champs[9]}`, inline: true },
                                { name: 'Rank', value: `${sranks[5]}
                                ${sranks[6]}
                                ${sranks[7]}
                                ${sranks[8]}
                                ${sranks[9]}`, inline: true },
                            )
                            .setImage('https://i.imgur.com/8wJPEzp.png')
                            .setTimestamp()
                            .setFooter({ text: 'Out of pure curiosity', iconURL: 'https://timotejkovacka.com/images/Picture6.png' });
                        const channel  = client.channels.cache.get(message.channelId);
                        channel.send({ embeds: [exampleEmbed]});
                    });
                });
            });
        });
    } else if (command === "sum") {
      const numArgs = args.map(x => parseFloat(x));
      const sum = numArgs.reduce((counter, x) => counter += x);
      message.reply(`The sum of all the arguments you provided is ${sum}!`);
    } else if (command === "s") {
        let summonerName = "";
        if (!args.length && message.author['id'] in polskyVodici) {
            summonerName = polskyVodici[message.author['id']];
        } else if (!args.length && !(message.author['id'] in polskyVodici)) {
            message.reply(`You are not a polsky vodic please provide summoner name`);
            return;
        } else {
            summonerName = args.join('%20');
        }
        const exampleEmbed = new Discord.MessageEmbed()
                            .setColor('#d21404')
                            .setTitle(`For more information about ${summonerName}`)
                            .setURL(`https://u.gg/lol/profile/eun1/${summonerName}/overview`)
                            .setAuthor({ name: "Korgis", iconURL: "https://timotejkovacka.com/images/Picture6.png", url: "https://www.timotejkovacka.com"})
                            .setDescription('Game Length: '+ minutes + "minutes " + seconds + "seconds")
                            .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/${versions[0]}/img/profileicon/${sumdata['profileIconId']}.png`)
                            .addFields(
                                //{ name: 'Regular field title', value: 'Some value here' },
                                //{ name: '\u200B', value: '\u200B' },
                                { name: 'Summoner', value: `${matchData['participants'][0]['summonerName']}
                                ${matchData['participants'][1]['summonerName']}
                                ${matchData['participants'][2]['summonerName']}
                                ${matchData['participants'][3]['summonerName']}
                                ${matchData['participants'][4]['summonerName']}`, inline: true },
                                { name: 'Champion', value: `${champs[0]}
                                ${champs[1]}
                                ${champs[2]}
                                ${champs[3]}
                                ${champs[4]}`, inline: true },
                                { name: 'Rank', value: `${sranks[0]}
                                ${sranks[1]}
                                ${sranks[2]}
                                ${sranks[3]}
                                ${sranks[4]}`, inline: true },
                                { name: 'Summoner', value: `${matchData['participants'][5]['summonerName']}
                                ${matchData['participants'][6]['summonerName']}
                                ${matchData['participants'][7]['summonerName']}
                                ${matchData['participants'][8]['summonerName']}
                                ${matchData['participants'][9]['summonerName']}`, inline: true },
                                { name: 'Champion', value: `${champs[5]}
                                ${champs[6]}
                                ${champs[7]}
                                ${champs[8]}
                                ${champs[9]}`, inline: true },
                                { name: 'Rank', value: `${sranks[5]}
                                ${sranks[6]}
                                ${sranks[7]}
                                ${sranks[8]}
                                ${sranks[9]}`, inline: true },
                            )
                            .setImage('https://i.imgur.com/8wJPEzp.png')
                            .setTimestamp()
                            .setFooter({ text: 'Out of pure curiosity', iconURL: 'https://timotejkovacka.com/images/Picture6.png' });
                        const channel  = client.channels.cache.get(message.channelId);
                        channel.send({ embeds: [exampleEmbed]});
    }
});
Promise.resolve(fetch("https://ddragon.leagueoflegends.com/api/versions.json")).then(data => {
    Promise.resolve(data.json()).then(d => {
        versions = d
        Promise.resolve(fetch(`http://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`)).then(data1 => {
            Promise.resolve(data1.json()).then(d1 => {
                champions = d1['data'];
                client.login(config.BOT_TOKEN);
            });
        });
    });
});