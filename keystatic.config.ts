import { collection, config, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';
import { site } from './src/config';

/**
 * Keystatic edits the same files Astro reads. Field names mirror src/lib/schema.ts exactly,
 * so a save from the editor produces frontmatter the collections accept.
 */
const components = {
  Aside: wrapper({
    label: 'Aside',
    description: 'A note, tip, or caution set apart from the running text.',
    schema: {
      kind: fields.select({
        label: 'Kind',
        options: [
          { label: 'Note', value: 'note' },
          { label: 'Tip', value: 'tip' },
          { label: 'Caution', value: 'caution' },
        ],
        defaultValue: 'note',
      }),
      title: fields.text({ label: 'Title', description: 'Optional. Defaults to the kind.' }),
    },
  }),
  OutcomeExplorer: block({
    label: 'Outcome explorer',
    description: 'Interactive diagram of the three check outcomes. Renders as static HTML without JavaScript.',
    schema: {},
  }),
  Transcript: wrapper({
    label: 'Transcript',
    description: 'A conversation with a model, as role-labeled turns. Put Turn blocks inside it.',
    schema: {
      model: fields.text({ label: 'Model', description: 'Who answered, for example Claude.' }),
      date: fields.text({ label: 'Date', description: 'Optional, shown in the head.' }),
    },
  }),
  Turn: wrapper({
    label: 'Turn',
    description: 'One turn of a transcript.',
    schema: {
      role: fields.select({
        label: 'Role',
        options: [
          { label: 'User', value: 'user' },
          { label: 'Model', value: 'model' },
          { label: 'System', value: 'system' },
        ],
        defaultValue: 'user',
      }),
      name: fields.text({ label: 'Name', description: 'Optional. Overrides the role label.' }),
    },
  }),
  Video: block({
    label: 'Video',
    description: 'A short silent demo that loops while on screen. Captioned like a figure.',
    schema: {
      src: fields.file({ label: 'Video file', directory: 'public/media', publicPath: '/media/' }),
      poster: fields.image({ label: 'Poster frame', directory: 'public/media', publicPath: '/media/' }),
      caption: fields.text({ label: 'Caption', multiline: true }),
    },
  }),
};

const shared = {
  title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
  description: fields.text({ label: 'Summary', multiline: true, validation: { isRequired: true } }),
  date: fields.date({ label: 'Publication date', validation: { isRequired: true }, defaultValue: { kind: 'today' } }),
  tags: fields.array(fields.text({ label: 'Topic' }), { label: 'Topics', itemLabel: (props) => props.value }),
  draft: fields.checkbox({ label: 'Draft', description: 'Drafts never appear on the public site.' }),
  sample: fields.checkbox({ label: 'AI-assisted sample', description: 'Adds the sample disclosure to the page.' }),
};

export default config({
  storage: import.meta.env.DEV ? { kind: 'local' } : { kind: 'github', repo: site.repo },
  ui: { brand: { name: site.title } },
  collections: {
    articles: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'src/content/articles/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['date', 'format'],
      schema: {
        ...shared,
        format: fields.select({
          label: 'Format',
          options: [
            { label: 'Essay', value: 'essay' },
            { label: 'Reading note', value: 'reading' },
          ],
          defaultValue: 'essay',
        }),
        featured: fields.checkbox({ label: 'Featured' }),
        source: fields.object(
          {
            title: fields.text({ label: 'Source title' }),
            url: fields.url({ label: 'Source URL' }),
            author: fields.text({ label: 'Source author' }),
          },
          { label: 'Source', description: 'For reading notes. Leave the URL empty when there is no source.' },
        ),
        body: fields.mdx({ label: 'Body', extension: 'mdx', components }),
      },
    }),
    notes: collection({
      label: 'Notes',
      slugField: 'title',
      path: 'src/content/notes/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['date'],
      schema: {
        ...shared,
        body: fields.mdx({ label: 'Body', extension: 'md' }),
      },
    }),
  },
});
