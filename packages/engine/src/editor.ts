import { merge } from 'lodash';
import Language from './language';
import {
	BlockModelInterface,
	CardEntry,
	CardModelInterface,
	ClipboardInterface,
	CommandInterface,
	ConversionInterface,
	EditorInterface,
	EditorOptions,
	EventInterface,
	EventListener,
	InlineModelInterface,
	LanguageInterface,
	MarkModelInterface,
	NodeIdInterface,
	NodeInterface,
	NodeModelInterface,
	PluginEntry,
	PluginModelInterface,
	RequestInterface,
	SchemaInterface,
	Selector,
} from './types';
import { ListModelInterface } from './types/list';
import language from './locales';
import NodeModel, { $, Event } from './node';
import Command from './command';
import Plugin from './plugin';
import Schema from './schema';
import schemaDefaultData from './constants/schema';
import Conversion from './parser/conversion';
import conversionDefault from './constants/conversion';
import CardModel from './card';
import NodeId from './node/id';
import Clipboard from './clipboard';
import Request from './request';
import List from './list';
import Mark from './mark';
import Inline from './inline';
import Block from './block';

class Editor<T extends EditorOptions = EditorOptions>
	implements EditorInterface<T>
{
	readonly kind: 'editor' | 'engine' | 'view' = 'editor';
	options: T = {
		lang: 'zh-CN',
		locale: {},
		plugins: [] as PluginEntry[],
		cards: [] as CardEntry[],
		config: {},
	} as T;
	readonly container: NodeInterface;

	language: LanguageInterface;
	root: NodeInterface;
	card: CardModelInterface;
	plugin: PluginModelInterface;
	node: NodeModelInterface;
	nodeId: NodeIdInterface;
	list: ListModelInterface;
	mark: MarkModelInterface;
	inline: InlineModelInterface;
	block: BlockModelInterface;
	event: EventInterface;
	schema: SchemaInterface;
	conversion: ConversionInterface;
	command: CommandInterface;
	clipboard: ClipboardInterface;
	request: RequestInterface;
	#_scrollNode: NodeInterface | null = null;

	get scrollNode(): NodeInterface | null {
		if (this.#_scrollNode) return this.#_scrollNode;
		const { scrollNode } = this.options;
		let sn = scrollNode
			? typeof scrollNode === 'function'
				? scrollNode()
				: scrollNode
			: null;
		// ?????????????????? overflow ?????? overflow-y ??? auto ?????? scroll ?????????
		const targetValues = ['auto', 'scroll'];
		let parent = this.container.parent();
		while (!sn && parent && parent.length > 0 && parent.name !== 'body') {
			if (
				targetValues.includes(parent.css('overflow')) ||
				targetValues.includes(parent.css('overflow-y'))
			) {
				sn = parent.get<HTMLElement>();
				break;
			} else {
				parent = parent.parent();
			}
		}
		if (sn === null) sn = document.documentElement;
		this.#_scrollNode = sn ? $(sn) : null;
		return this.#_scrollNode;
	}

	constructor(selector: Selector, options?: EditorOptions) {
		this.options = { ...this.options, ...options };
		this.container = $(selector);
		// ?????????
		this.language = new Language(
			this.options.lang || 'zh-CN',
			merge(language, options?.locale),
		);
		// ????????????
		this.event = new Event();
		// ??????
		this.command = new Command(this);
		// ????????????
		this.schema = new Schema();
		this.schema.add(schemaDefaultData);
		// ??????????????????
		this.conversion = new Conversion(this);
		conversionDefault.forEach((rule) =>
			this.conversion.add(rule.from, rule.to),
		);
		// ??????
		this.card = new CardModel(this, this.options.lazyRender);
		// ?????????
		this.clipboard = new Clipboard(this);
		// http??????
		this.request = new Request();
		// ??????
		this.plugin = new Plugin(this);
		// ????????????
		this.node = new NodeModel(this);
		this.nodeId = new NodeId(this);
		// ??????
		this.list = new List(this);
		// ????????????
		this.mark = new Mark(this);
		// ????????????
		this.inline = new Inline(this);
		// ????????????
		this.block = new Block(this);
		// ??????????????????
		this.root = $(
			this.options.root || this.container.parent() || document.body,
		);
		const rootPosition = this.root.css('position');
		if (!rootPosition || rootPosition === 'static')
			this.root.css('position', 'relative');
	}

	init() {
		// ???????????????
		this.mark.init();
		this.inline.init();
		this.block.init();
		this.list.init();
		this.card.init(this.options.cards || []);
		this.plugin.init(this.options.plugins || [], this.options.config || {});
		this.nodeId.init();
	}

	setScrollNode(node?: HTMLElement) {
		this.#_scrollNode = node ? $(node) : null;
	}

	on<R = any, F extends EventListener<R> = EventListener<R>>(
		eventType: string,
		listener: F,
		rewrite?: boolean,
	) {
		this.event.on(eventType, listener, rewrite);
		return this;
	}

	off(eventType: string, listener: EventListener) {
		this.event.off(eventType, listener);
		return this;
	}

	trigger<R = any>(eventType: string, ...args: any): R {
		return this.event.trigger<R>(eventType, ...args);
	}

	messageSuccess(message: string) {
		console.log(`success:${message}`);
	}

	messageError(error: string) {
		console.log(`error:${error}`);
	}

	messageConfirm(message: string): Promise<boolean> {
		console.log(`confirm:${message}`);
		return Promise.reject(false);
	}

	destroy() {
		this.event.destroy();
		this.plugin.destroy();
		this.card.destroy();
		this.container.empty();
	}
}

export default Editor;
