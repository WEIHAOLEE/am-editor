import ElementPluginEntry from './element';
import { SchemaBlock, BlockInterface, NodeInterface } from '../types';

abstract class BlockEntry<T extends {} = {}> extends ElementPluginEntry<T>
	implements BlockInterface {
	readonly kind: string = 'block';
	/**
	 * 标签名称
	 */
	abstract readonly tagName: string | Array<string>;

	/**
	 * 该节点允许可以放入的block节点
	 */
	readonly allowIn?: Array<string>;
	/**
	 * 禁用的mark插件样式
	 */
	readonly disableMark?: Array<string>;
	/**
	 * 是否能够合并
	 */
	readonly canMerge?: boolean;

	schema(): SchemaBlock | Array<SchemaBlock> {
		const schema = super.schema();
		if (Array.isArray(schema)) {
			return schema.map(schema => {
				return {
					...schema,
					allowIn: this.allowIn,
					disableMark: this.disableMark,
				} as SchemaBlock;
			});
		}
		return {
			...schema,
			allowIn: this.allowIn,
			disableMark: this.disableMark,
			canMerge: this.canMerge,
		} as SchemaBlock;
	}
	/**
	 * Markdown 处理
	 */
	markdown?(
		event: KeyboardEvent,
		text: string,
		block: NodeInterface,
		node: NodeInterface,
	): boolean | void;
}

export default BlockEntry;