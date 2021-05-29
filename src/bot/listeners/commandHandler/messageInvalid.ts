import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MessageInvalidListener extends Listener {
	public constructor() {
		super('messageInvalid', {
			event: 'messageInvalid',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	public async exec(message: Message) {
		if (message.guild && message.util!.parsed!.prefix) {
			if (!message.util!.parsed!.alias || !message.util!.parsed!.afterPrefix) return;
			const command = this.client.commandHandler.modules.get('tag-show');
			return this.client.commandHandler.handleDirectCommand(message, message.util!.parsed!.afterPrefix, command!, false);
		}
	}
}