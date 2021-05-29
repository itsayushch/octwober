import { Command, Flag } from 'discord-akairo';
import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';

export default class TagCommand extends Command {
    public constructor() {
        super('tag', {
            aliases: ['tag'],
            category: 'tag',
            clientPermissions: ['EMBED_LINKS'],
            typing: true,
            description: {
                content: stripIndents`Available methods:
                    • show \`<tag>\`
                    • add \`[--pin] <tag> <content>\`
                    • del \`<tag>\`
                    • search \`<tag>\`
                    • list \`[member]\`

                   Required: \`<>\` | Optional: \`[]\`

                   For additional \`<...arguments>\` usage refer to the examples below.`,

                usage: '<method> <...arguments>',
                examples: []
            },
        });
    }

    public *args(): unknown {
        const sub = yield {
            type: [
                ['tag-add', 'add'],
                ['tag-show', 'show'],
                ['tag-list', 'list'],
                ['tag-delete', 'delete', 'del'],
                ['tag-search', 'search']
            ],
            otherwise: () => this.client.util.embed().addField('• Description', this.description.content)
        };

        return Flag.continue(sub);
    }
}