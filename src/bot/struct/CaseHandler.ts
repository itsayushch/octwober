import { Collection, ObjectId } from 'mongodb';
import { COLLECTION } from '#utils/Constants';
import Client from '#bot/client/Client';
import MuteScheduler from '#struct/MuteHandler';

export interface Case {
	_id: ObjectId;
	guild: string;
	action: number;
	reason?: string;
	case_id: number;
	closed: boolean;
	duration?: Date;
	processed: boolean;
	user_id: string;
	user_tag: string;
	author_id: string;
	author_tag: string;
	message: string;
	reference?: string;
	createdAt: Date;
	updatedAt: Date;
}

export default class CaseHandler {
	public mutes!: MuteScheduler;
	protected collection: Collection<Case>;
	
	public constructor(private readonly client: Client) {
		this.collection = this.client.db.collection(COLLECTION.CASES);
		this.mutes = new MuteScheduler(this.client);
	}

	public async create(target: Omit<Case, '_id'>) {
		return this.collection.insertOne({
			guild: target.guild,
			action: target.action,
			reason: target.reason,
			case_id: target.case_id,
			closed: false,
			duration: target.duration,
			processed: false,
			user_id: target.user_id,
			user_tag: target.user_tag,
			author_id: target.author_id,
			author_tag: target.author_tag,
			message: target.message,
			reference: target.reference,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}
}