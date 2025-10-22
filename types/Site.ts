export type Site = {
	id: number;
	url: string;
	selector: string;
	name: string;
	description?: string | null;
	last_value?: string | null;
	last_checked?: string | null;
	last_changed?: string | null;
};
