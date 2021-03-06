import { Message, MessageReaction, User } from 'discord.js';
import { readdirSync } from 'fs';
import { evaluate } from 'mathjs';
import Client from '../client/client';
import path from 'path';
import { Command } from './Types';

export default class Funtions {
    public async parseCommand(message: Message) {
        let prefixes: string | string[] = (message.client as Client).prefix(message);
        const mentions = [`<@${message.client.user.id}>`, `<@!${message.client.user.id}>`];
        prefixes = [...mentions, prefixes];

        return this.parseMultiplePrefixes(message, prefixes.map((p: string) => [p, null]));
    }

    public parseMultiplePrefixes(message: Message, pairs: Array<string[]>) {
        const parses = pairs.map(([prefix]) => this.parsePrefix(message, prefix));
        const result = parses.find(parsed => parsed.command);
        if (result) {
            return result;
        }

        const guess = parses.find(parsed => parsed.prefix != null);
        if (guess) {
            return guess;
        }

        return {};
    }


    public parsePrefix(message: Message, prefix: string) {
        const msg = message.content.toLowerCase();
        if (!msg.startsWith(prefix.toLowerCase())) return {};

        const client = message.client as Client;

        const endOfPrefix = msg.indexOf(prefix.toLowerCase()) + prefix.length;
        const startOfArgs = message.content.slice(endOfPrefix).search(/\S/) + prefix.length;
        const alias = message.content.slice(startOfArgs).split(/\s{1,}|\n{1,}/)[0];
        const command = client.commands.get(alias) || client.commands.find((cmd: Command) => cmd.aliases && cmd.aliases.includes(alias));

        const content = message.content.slice(startOfArgs + alias.length + 1) ? message.content.slice(startOfArgs + alias.length + 1).trim().split(/ +/) : [];
        const afterPrefix = message.content.slice(prefix.length).trim();

        if (!command) {
            return { prefix, alias, content, afterPrefix };
        }

        if (command.ownerOnly && message.author.id !== client.owner) {
            return { prefix, alias, content, afterPrefix };
        }

        return { command, prefix, alias, content, afterPrefix };
    }

    public loadCommands(client: Client) {
        const commandFiles = readdirSync(path.join(__dirname, '..', 'commands'));
        for (const file of commandFiles) {
            const { command } = require(`../commands/${file}`);
            client.commands.set(command.name, command);
        }
    }

    public loadListeners(client: Client) {
        const files = readdirSync(path.join(__dirname, '..', 'listeners'));
        for (const file of files) {
            client.listener.push(file);
        }
    }

    public random(min: number = 0, max: number = 10): number {
        return Math.floor((Math.random() * (max - min)) + min);
    }


    public randomMessage() {
        const messages: Array<string> = [
            'Who will fill the void?',
            'Moment of silence.',
            'Hope they come back again.',
            'You\'ll be missed!',
            'Hope they have enjoyed here.'
        ];

        const random: number = this.random(0, messages.length);

        return messages[random];
    }

    public getDay(): string {
        const weekday = new Array(7);
        weekday[0] = 'Sunday';
        weekday[1] = 'Monday';
        weekday[2] = 'Tuesday';
        weekday[3] = 'Wednesday';
        weekday[4] = 'Thursday';
        weekday[5] = 'Friday';
        weekday[6] = 'Saturday';

        return weekday[new Date().getDay()];
    }

    public counting(message: Message): Promise<Message | MessageReaction> {
        const client = message.client as Client;
        let { count, num, lastUser } = client.settings.get(message.guild.id, 'counting', {
            count: 0,
            num: 0,
            lastUser: undefined
        });

        try {
            count = evaluate(message.content);
        } catch (e) {
            return;
        }

        if (isNaN(count)) return;

        if (num === 0 && (count > 1 || count < 1)) {
            num = 0;
            lastUser = undefined;
            void client.settings.set(message.guild.id, 'counting', {
                num,
                count,
                lastUser
            });
            message.react('765561568196034571');
            return message.channel.send('Incorrect number! The next number is `1`. **No stats have been changed since the current number was 0.**');
        } else if (count === num + 1) {
            if (lastUser && lastUser === message.author.id) {
                message.react('765561568196034571');
                const Lastnum: number = num;
                lastUser = undefined;
                num = 0;
                void client.settings.set(message.guild.id, 'counting', {
                    num,
                    count,
                    lastUser
                });
                return message.channel.send(`${message.author.toString()} RUINED IT AT \`${Lastnum}\` Next number is \`1\`. **You can't count two numbers in a row.**`);
            }
            lastUser = message.author.id;
            num++;
            void client.settings.set(message.guild.id, 'counting', {
                num,
                count,
                lastUser
            });
            return message.react('711106998967599156');
        } else {
            message.react('765561568196034571');
            const Lastnum: number = num;
            lastUser = undefined;
            num = 0;
            void client.settings.set(message.guild.id, 'counting', {
                num,
                count,
                lastUser
            });
            return message.channel.send(`${message.author.toString()} RUINED IT AT \`${Lastnum}\` Next number is \`1\`. **Wrong number.**`);
        }
    }
}
