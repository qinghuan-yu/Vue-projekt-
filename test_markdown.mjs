
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

const text1 = '刚好有人~~（粥p）~~找我合作';
const text2 = 'Arknights风格~~（查重率100%）~~，经历了三个月之久';
const textFull = '刚好有人~~（粥p）~~找我合作... Arknights风格~~（查重率100%）~~，经历了三个月之久';

console.log('--- Test 1 ---');
console.log(md.render(text1));

console.log('--- Test 2 ---');
console.log(md.render(text2));

console.log('--- Test Full ---');
console.log(md.render(textFull));

const textFix1 = '刚好有人 ~~（粥p）~~ 找我合作... Arknights风格 ~~（查重率100%）~~ ，经历了';
console.log('--- Fix 1 (Spaces) ---');
console.log(md.render(textFix1));

const textFix2 = '刚好有人（~~粥p~~）找我合作... Arknights风格（~~查重率100%~~），经历了';
console.log('--- Fix 2 (Move Punctuation Out) ---');
console.log(md.render(textFix2));

