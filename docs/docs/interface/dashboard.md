---
sidebar_label: Project Dashboard
sidebar_position: 3
---

# Project Dashboard

## Overview

The Overview section provides a comprehensive summary of the project's key metrics, essential for monitoring its progress and performance. The metrics displayed include:

- **Total Texts**: The total number of texts included in the project.
- **Texts Annotated**: The number of texts that have been annotated.
- **Annotation Progress**: The percentage of the project that has been annotated, calculated as (Texts Annotated / Total Texts) \* 100.
- **Initial Vocabulary Size**: The size of the vocabulary at the project's inception.
- **Adjusted Vocabulary Size**: The current size of the vocabulary, reflecting any additions or deletions made since the project began.
- **Vocabulary Reduction Rate**: The percentage reduction in vocabulary size, calculated as ((Initial Vocabulary Size - Adjusted Vocabulary Size) / Initial Vocabulary Size) \* 100.
- **Initial Token Count**: The count of tokens in the texts at the start of the project.
- **Current Token Count**: The current count of tokens, after any processing or corrections.
- **Corrections Applied**: The total number of corrections made to the texts.
- **Unnormalised Tokens**: The number of tokens that have not been normalised to a standard form.
- **Inter-Annotator Agreement**: This metric is currently in development and not available. It will provide a measure of consistency among annotators.
- **Greatest Contributor**: This metric, also in development, will identify the annotator who has contributed the most to the project.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/dashboard/overview.png" alt="Dashboard Overview Section" width="80%"/>
</div>

## Details

This section offers an in-depth summary of the project, including essential information such as the project's name, description, and details regarding special tokens used, preprocessing steps undertaken, and other aspects like the creation time and the type of corpus uploaded. Both the project name and description are dynamic and can be updated at any point.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/dashboard/details.png" alt="Dashboard Details Section" width="80%"/>
</div>

## Replacements

The Replacements section documents the token transformations applied across the project, showcasing input/output pairs. It distinguishes between "new" replacements (those applied outside any pre-existing dictionary) and others, offering insights into the replacements' application frequency by project annotators. This visibility into token transformations is crucial for understanding modifications made to the text corpus.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/dashboard/replacements.png" alt="Dashboard Replacements Section" width="80%"/>
</div>

## Schema

Adjusting your project's entity schema is facilitated in this section. While adding new or editing existing entity labels is seamless, it's important to note that removal of labels is not supported at this time. Each label displays a count badge indicating the number of gazetteer words or phrases associated with it, which were identified during project setup for preliminary annotations. Selection and deselection of labels are easily done with a simple left-click. See [Schema Editor](./flag-editor) for more details on this component.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/dashboard/schema.png" alt="Dashboard Schema Section" width="80%"/>
</div>

## Flags

Mirroring the project creation phase, this section allows for the creation, modification, and deletion of flags specific to your project. It's vital to exercise caution when deleting a flag, as this action will also remove all annotations linked to that flag, potentially leading to significant data loss. See [Flag Editor](./flag-editor) for more details on this component.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/dashboard/flags.png" alt="Dashboard Flags Section" width="80%"/>
</div>

## Annotators

:::warning
This feature is currently under development.
:::

Upon completion, this area will enable project managers to invite annotators to the project, granting them access to all associated texts for annotation purposes.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/dashboard/annotators.png" alt="Dashboard Annotators Section" width="80%"/>
</div>

## Adjudication

This ...

## Settings

The Settings section provides options to download all project annotations or to delete the project entirely. It is crucial to remember that deleting the project is a permanent action and cannot be reversed, so it should be done with utmost consideration.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/dashboard/settings.png" alt="Dashboard Settings Section" width="80%"/>
</div>
