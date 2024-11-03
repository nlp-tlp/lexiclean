---
label: Project Creation
sidebar_position: 2
---

# Project Creation

Creating a project with LexiClean involves a few straightforward steps. Navigating to the project creation page (`/create`) is as simple as clicking "New Project" in the left sidebar. Each section below will guide you through this process.

:::info
LexiClean automatically indicates where your input is required and confirms when your inputs are valid.
:::

## Details

Begin by defining the core aspects of your project:

- **Project Name**: Choose a unique name that reflects the essence of your project. Remember, this can be modified later if needed.
- **Project Description**: Provide a brief overview of your project. This helps annotators understand the context and objectives. You're free to update this description as your project evolves.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/project_creation/details.png" alt="Project Creation Details Section" width="80%"/>
</div>

## Data

Please visit the [Concepts: Datasets](../concepts/datasets) page for detailed information on the different types of datasets that can be used in LexiClean.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/project_creation/data.png" alt="Project Creation Data Section" width="80%"/>
</div>

## Preprocessing

:::info
Real-time corpus metrics will be presented to you based on the preprocessing options you select.
:::

During project setup, you'll have access to real-time corpus metrics influenced by your chosen preprocessing options:

- Lowercase: Standardise your text to lowercase for uniformity.
- Remove Characters: Clean your text by removing unwanted characters.
- Remove Duplicates: Eliminate duplicate entries to refine your corpus.

Metrics Displayed:

- Corpus Size
- Vocabulary Size
- Token Count

A corpus preview is available, showcasing a snippet of your text after preprocessing. This ensures your preprocessing choices align with your project goals before finalising.

:::info
Visit the [Concepts: Preprocessing](../concepts/preprocessing) page for more information.
:::

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/project_creation/preprocessing.png" alt="Project Creation Preprocessing Section" width="80%"/>
</div>

## Replacements

:::info
Streamline your corpus effortlessly with our replacement feature, which automates the detection and update of specific words (tokens). As of now, we cater to single-word replacements, but exciting updates are on the horizon! Ready to optimise your project? You can either manually input or paste your replacement dictionary directly in JSON format.
:::

Please visit the [Replacements Editor](./replacements-editor) page for detailed information on how to interact with this component.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/project_creation/replacements.png" alt="Project Creation Replacements Section" width="80%"/>
</div>

## Schema

:::info
Here you can create a schema of entity labels for token-level entity tagging to support your annotation project.
:::

Please visit the [Schema Editor](./schema-editor) page for detailed information on how to interact with this component.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/project_creation/schema.png" alt="Project Creation Schema Section" width="80%"/>
</div>

## Flags

:::info
Flags are powerful tools for highlighting texts that require extra attention—be it for uncertainty, the need for further clarification, or quality enhancement. For instance, flag texts that seem ambiguous or might benefit from a second review.
:::

Please visit the [Flag Editor](./flag-editor) page for detailed information on how to interact with this component.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/project_creation/flags.png" alt="Project Creation Flags Section" width="80%"/>
</div>

## Settings

<!-- - Are there any special tokens in your project?

Enter your special tokens separated by commas (e.g., `<id>`, `<sensitive>`, etc). These tokens will be recognised as part of the vocabulary when your project is created.

- Apply Replacement Dictionary Automatically?

Enable this to auto-apply replacements to your corpus for faster annotation. You can revert these changes anytime.

- Auto-label Words Using Your Schema?

Activating this will apply your schema labels automatically to your corpus, accelerating the annotation process. Changes are reversible.

- Treat Digits as In-vocabulary?

This treats numerical values (e.g., 1, 22, 388) as known vocabulary. Note: This action is permanent.

- Prioritise Texts with Inverse TF-IDF?

LexiClean can prioritise your texts based on 'value-add' of normalisations, using an inverse tf-idf strategy on masked out-of-vocabulary tokens. -->

Finalise your project with these settings:

- **Special Tokens**: List any tokens unique to your project (e.g., `<id>`, `<sensitive>`). These will be included in your project's vocabulary.
- **Automatic Replacement Dictionary Application**: Opt to automatically apply your replacement dictionary to streamline the annotation process.
- **Auto-labeling with Schema**: Enable this to apply schema labels to your corpus automatically, boosting the efficiency of the annotation workflow.
- **Digit Recognition as In-vocabulary**: Opt to treat numerical values as known vocabulary. This setting is irreversible.
- **Text Prioritisation with Inverse TF-IDF**: Activate to prioritise texts based on the potential impact of normalisations, employing an inverse TF-IDF strategy for out-of-vocabulary tokens.

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src="/img/interface/project_creation/settings.png" alt="Project Creation Settings Section" width="80%"/>
</div>

By following these steps and utilising LexiClean's features, you'll be well on your way to efficiently creating a project tailored to your annotation needs.
