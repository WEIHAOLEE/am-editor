import { Mark } from '@aomao/engine';

export type Options = {
	hotkey?: string | Array<string>;
	markdown?: boolean;
};
export default class extends Mark<Options> {
	tagName = 'del';

	static get pluginName() {
		return 'strikethrough';
	}

	hotkey() {
		return this.options.hotkey || 'mod+shift+x';
	}

	markdown = this.options.markdown !== false ? '~~' : '';
}