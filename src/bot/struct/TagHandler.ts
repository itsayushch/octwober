import { COLLECTION } from '#utils/Constants';
import { Collection, ObjectId } from 'mongodb';
import Client from '#bot/client/Client';

export interface Tag {
	_id?: ObjectId;
	name: string;
	user: string;
	uses: number;
	guild: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	hoisted: boolean;
	aliases: string[];
	lastModified: string;
}

export default class TagsProvider {
	public collection: Collection<Tag>;

	public constructor(private readonly client: Client) {
		this.collection = this.client.db.collection(COLLECTION.TAGS);
	}

	public async create(tag: Tag) {
		await this.collection.insertOne({
			name: tag.name,
			aliases: [tag.name],
			user: tag.user,
			guild: tag.guild,
			hoisted: tag.hoisted,
			uses: tag.uses,
			content: tag.content,
			createdAt: tag.createdAt,
			updatedAt: tag.updatedAt,
			lastModified: tag.lastModified
		});
	}

	public async delete(name: string, guild: string) {
		const tag = name.toLowerCase();
		return this.collection.deleteOne(
			{
				$and: [
					{ guild },
					{ $or: [{ name: tag }, { aliases: tag }] }
				]
			}
		);
	}

	public async find(name: string, guild: string) {
		return this.collection.findOne(
			{
				$and: [
					{ guild },
					{ $or: [{ name }, { aliases: name }] }
				]
			},
			{ collation: { strength: 2, locale: 'en' } }
		);
	}

	public uses(_id: ObjectId) {
		return this.collection.updateOne({ _id }, { $inc: { uses: 1 } });
	}
}