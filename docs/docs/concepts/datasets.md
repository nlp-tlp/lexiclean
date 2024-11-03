---
sidebar_position: 1
sidebar_label: Datasets
---

# Datasets

## Overview

LexiClean streamlines text dataset management by supporting uploads in CSV (comma-separated values) format. It offers three distinct dataset types—`standard`, `standard with identifiers`, and `parallel`—each designed to cater to specific requirements, from basic text handling to associating texts with external references.

### Important Notes for Preparing Your Data

Before uploading your datasets to LexiClean, it's crucial to prepare your data correctly to ensure the best possible processing and annotation experience. Here are some key points to consider:

- **Quoting Text Fields**: To prevent commas within texts from causing parsing errors, it is crucial to enclose all text fields in double quotes. For example, texts should be formatted as "Suddenly, a white rabbit...".
- **Tokenization:** LexiClean uses whitespace tokenization for text analysis. If your text requires specialized tokenization, it should be handled prior to upload.
- **Using External Identifiers**: External identifiers can be added to your dataset to enhance the annotation process. These identifiers become visible when hovering over the text index in the [annotation interface](../interface/annotation/texts#document-index), providing additional context or reference points for annotators. For further details on optimising identifiers for a better annotator experience, see [Enhancing Identifiers with Contextual Information](#enhancing-identifiers-with-contextual-information).

## Standard Dataset

The simplest form of dataset supported by LexiClean, consisting of a single column CSV file with a header named `text`.

_Example of a Standard Dataset CSV:_

```csv
text
"Alicce was beginnning to get vvvery tired of sitting by her sister on the bankk."
"So she wass considering in her owm mind, as welll as she could, for the hot day madde her feel verry sleepy and stupid."
"Suddenly, a whiite rabbit with pink eyess ran close by her."
"The rabit acttually took a watch outt of its waistcoat-pockett and loooked at it."
"Burning with curiiosity, shee ran acrosss the field after it, wondering what could happen next."
```

## Standard Dataset with Identifiers

An extension of the standard dataset, this format includes an `identifier` column. It's particularly useful for linking dataset entries to external records or databases. LexiClean's "Drop Duplicates" feature can merge identifiers of duplicate entries, simplifying the annotators' task and maintaining reference integrity.

_Example of a CSV with Unique Identifiers:_

```csv
identifier,text
ch01_pp10_11,"Alicce was beginnning to get vvvery tired of sitting by her sister on the bankk."
ch01_pp11_12,"So she wass considering in her owm mind, as welll as she could, for the hot day madde her feel verry sleepy and stupid."
```

_Example Showing Identifier Handling Post-Lowercase Preprocessing and Duplicate Removal:_

> This demonstrates how texts that become identical post-processing (due to case adjustments) are treated. Their identifiers are combined, reducing redundancy in annotation tasks.

```csv
identifier,text
1,"REPLACE ENG",
// more texts
20,"replace eng"
```

_After Preprocessing:_

> Here, we see the consolidation of texts that are identical after processing. LexiClean merges their identifiers, ensuring each text requires annotation only once.

:::info
Below is how LexiClean amalgamates texts after processing, illustrated with a JSON structure.
:::

```json
[
  {
    "ids": ["1", "20"], // Includes any other identifiers that match the "text" post-processing.
    "text": "replace eng"
  }
  // Additional texts
]
```

## Parallel Reference Dataset

Designed for projects requiring a side-by-side view of original and modified texts, such as those involving error correction, translation, or content masking. This dataset includes `identifier`, `reference`, and `text` fields, with preprocessing applied only to the `text` field.

This structure supports external preprocessing tasks, like regex-based masking, ensuring that the original context is preserved during text modifications. The `reference` field remains untouched, while the `text` field can be edited within LexiClean.

_Example of a Parallel Reference Dataset:_

> This instance shows a dataset prepared with text modifications and identifier masking before being uploaded to LexiClean.

```csv
identifier,reference,text
1,"ENG01 BLOWN GSKT - C/O","<id> blown gskt - c/o"
// Additional texts
```

## Enhancing Identifiers with Contextual Information

For datasets with multiple relevant fields, like maintenance records or electronic health records, the `identifier` field can offer additional context, aiding annotation. Consider a maintenance work order example:

```csv
id,functional location,type,text
1234,"TK012-DRIV-BKST","PM02","12000H Mech Ovhl Slack Adju F 123B WC09"
```

A direct approach uses a standard dataset with identifiers:

```csv
identifier,text
1234,"12000H Mech Ovhl Slack Adju F 123B WC09"
```

However, combining the `id`, `functional location`, and `order type` fields into a single `identifier` before uploading can give annotators richer context, enhancing consistency and efficiency by reducing the need to refer back to source databases:

```csv
identifier,text
"1234_TK012-DRIV-BKST_PM02","12000H Mech Ovhl Slack Adju F 123B WC09"
```
