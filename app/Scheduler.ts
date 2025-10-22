import cron, { type TaskFn } from "node-cron";
export class Scheduler {
	constructor() {}
	static addScheduler(
		expression: string,
		func: Function,
		immediate: boolean = true
	) {
		if (immediate) func();
		cron.schedule(expression, func as TaskFn);
	}
}
