import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import ms from 'ms';

export default class AFKUserMessageListener extends Listener {

	public constructor() {
		super('afkUserMessage', {
			event: 'message',
			emitter: 'client',
			category: 'client'
		});
	}

	public async exec(message: Message) {
		if (message.author.bot) return;

        const afk = this.client.settings.get<{ afk: boolean; reason: string; started: Date }>(message.author.id, 'afk');
        if (!afk) return;

		const guild = this.client.guilds.cache.get('694554848758202451');
		if (!guild) return;

		guild.members.cache.get(message.author.id)?.setNickname('').catch(() => null);

        this.client.settings.delete(message.author?.id, 'afk')
        return message.inlineReply(`I have removed your AFK since you have sent a message.\nYour AFK duration was: **${ms(new Date().getTime() - afk.started.getTime())}**.`);
        
	}

}