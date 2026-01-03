import moment, { Moment } from "moment"

export class UUID {
	/** Generates a unique 16-character alphanumeric id. */
	static generate(): UUID {
		return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
	}
}

export type NoteEntry = {
	name: string
	timestamp: Moment
	text: string
}

export class Notes {
	private _entries: NoteEntry[] = []

	/** Creates a new Notes instance.
	 * 
	 * @param entries An array of note entries.
	 */
	constructor(entries: NoteEntry[] = []) {
		this._entries = entries
	}

	/** Get all note entries. */
	get entries(): NoteEntry[] {
		return this._entries
	}

	/** Add a new note entry.
	 * 
	 * @param name The name of the person adding the note.
	 * @param text The text of the note.
	 * @returns The updated array of note entries.
	 */
	addEntry(name: string, text: string) {
		const timestamp = moment()
		const entry = { name, timestamp, text } as NoteEntry
		this._entries.push(entry)
	}

	/** Edit an existing note entry by index.
	 * 
	 * @param index The index of the note entry to edit.
	 * @param text The new text for the note entry.
	 */
	editEntry(index: number, text: string) {
		this._entries[index].text = text
	}

	/** Remove a note entry by index.
	 * 
	 * @param index The index of the note entry to remove.
	 * @returns The updated array of note entries.
	 */
	removeEntry(index: number) {
		this._entries.splice(index, 1)
	}

	/** Parse a Notes instance from a plain object or JSON string.
	 * 
	 * @param data The plain object or JSON string representing the notes.
	 * @returns A Notes instance.
	 */
	static parse(data: NoteEntry[] | string | Notes | null | undefined): Notes {
		if (data == null) {
			return new Notes()
		}

		if (data instanceof Notes) {
			return new Notes(data.entries)
		}

		if (typeof data === 'string') {
			data = JSON.parse(data)
		}

		const entries = (data as any).entries.map((entry: any) => {
			if (!('timestamp' in entry) || !('name' in entry) || !('text' in entry)) return null
			return {
				name: entry.name,
				timestamp: moment(entry.timestamp),
				text: entry.text
			} as NoteEntry
		}).filter(Boolean)

		return new Notes(entries)
	}
}