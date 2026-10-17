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
