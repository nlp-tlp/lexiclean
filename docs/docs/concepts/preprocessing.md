---
sidebar_label: Preprocessing
sidebar_position: 2
---

# Preprocessing Enhancements

:::warning
We're working on bringing more advanced preprocessing features to LexiClean. Your patience is appreciated. If you're eager to help, please consider [contributing to the project](../contribute).
:::

LexiClean simplifies your project setup by offering built-in preprocessing tools, eliminating the need for external software for initial text preparations. This integration ensures a seamless workflow from the get-go. During [project creation](../interface/create), you can choose from various preprocessing options, which will also be accessible from the project's [dashboard](../interface/dashboard) after setup.

## Transform to Lowercase

- **What It Does**: Converts all text within your project to lowercase.
- **Why It's Useful**: Case sensitivity can impact the accuracy of word matching. By standardizing the text to lowercase, you simplify word comparison, improving search and retrieval accuracy — essential for projects where case does not matter.

**Example**:

```plain
Before: REPLACE ENGINE OIL -> After: replace engine oil
Before: Replace ENG oil -> After: replace eng oil
```

## Character Removal

- **What It Does**: Removes unnecessary characters from your texts, replacing them with whitespace to avoid accidental word merges.
- **Ideal For**: Cleaning up texts that are cluttered with unwanted characters, ensuring your corpus is clear and high-quality.

**Example**:

Removing characters `${};` results in:

```plain
Before: {REPLACE} {{ENGINE}} OIL -> After: replace engine oil
Before: Replace ENG $$oil -> After: replace eng oil
```

## Duplicate Removal

- **What It Does**: Identifies and removes duplicate texts from your corpus.
- **Why It's Useful**: Eliminating duplicates focuses your annotation efforts on unique texts, increasing the efficiency and effectiveness of your project.
- **Data Integrity**: LexiClean keeps a careful record of text IDs. When duplicates are removed, their IDs are merged, ensuring links to external databases or datasets remain intact, preserving data continuity. These links are resolved when [downloading your annotated dataset](../interface/dashboard).

```plain
1: {REPLACE} {{ENGINE}} OIL
2: Replace ENG $$oil
3: Replace ENG $$oil // This duplicate will be removed, matching entry (2)
```
