---
sidebar_label: Limitations
sidebar_position: 16
---

# Limitations of LexiClean

LexiClean strives to offer a comprehensive and user-friendly platform for text annotation and data preparation. However, like any software, it has certain limitations. Being aware of these can help users navigate the tool more effectively and plan their projects with these considerations in mind.

:::info
We are committed to the continuous improvement of LexiClean. If you're interested in contributing or have feedback, please see our [contribution information](contribute) or [contact us](contact).
:::

## Sequence Length Modification

- **Description**: LexiClean does not support altering sequence lengths by splitting or merging tokens, as this complicates token-level adjudication. However, annotators can add whitespace within a token to indicate a suggested split without altering its token status in LexiClean.
- **Example**: If the text contains "replaceengine," it cannot be split into "replace" and "engine" as separate tokens. Annotators can insert a space ("replace engine"), and use labels like `Requires Splitting` for further action outside of LexiClean. This situation is relatively rare and manageable with current functionalities.

## Unsupported Languages

- **Description**: LexiClean is primarily optimised for English. It has limited support for languages without whitespace token separation, such as Chinese or Japanese.
- **Example**: "我爱你" won't be automatically tokenized. External preprocessing might be necessary for such languages.

:::info
Expanding language support is on our roadmap. Interested in helping? Please [contribute](contribute) or [contact us](contact).
:::

## Real-time Collaboration Limits

- **Description**: LexiClean supports collaborative annotation but not in real-time. Changes require a page refresh to appear for other users. Annotations by others are reviewed in the adjudication component of the dashboard, aligning with our design for thoughtful, non-disruptive collaboration.

## Custom Model Integration

- **Description**: LexiClean does not currently support direct integration of custom Machine Learning (ML) models for automated suggestions or annotations. Users must rely on the provided tools and OpenAI's GPT model for AI suggestions.
- **Example**: Organisations with bespoke NLP models for specific tasks (e.g., lexical normalisation, specialised entity recognition) cannot directly integrate these models into LexiClean for automated annotation suggestions.

## Large Dataset Processing

- **Description**: Handling extremely large datasets can lead to performance issues within the LexiClean interface. Projects with tens of thousands of texts may experience slower load times and responsiveness. However, projects of this size are typically infesible to annotate manually.
- **Example**: Uploading a dataset containing 100,000+ texts for annotation might result in laggy performance when navigating through the project dashboard or annotation view.

:::info
For large datasets, consider dividing your data into smaller, more manageable projects.
:::

## API Limitations

- **Description**: LexiClean provides a limited API for accessing and managing project data programmatically. This may restrict automated workflows or integrations with external systems.
- **Example**: Automated data extraction or project updates via API calls are limited to certain functionalities, which might not cover all use cases like bulk data manipulation or detailed project analytics.

Understanding these limitations is crucial for effectively planning and executing your annotation projects with LexiClean. For more detailed information or potential workarounds, please contact our support team or refer to the specific sections of our documentation.
