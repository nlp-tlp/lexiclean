---
title: Introduction
description: LexiClean documentation
keywords:
  - lexiclean
  - docs
  - manual
  - annotation
sidebar_position: 1
slug: /
sidebar_label: Introduction
---

# Introduction

:::warning
The documentation is currently under development and may not cover all features comprehensively. Your patience is appreciated. Should you have queries not addressed here, feel free to [contact us](./contact).
:::

## Overview

Welcome to **LexiClean**, the forefront solution in improving text quality and semantic content tagging. Emerging from the need for a multifunctional natural language processing (NLP) tool, LexiClean distinguishes itself by enabling both text quality enhancement and semantic tagging. This dual capability renders it essential for projects demanding precise text improvement and confidential information handling in a collaborative setting.

What sets LexiClean apart is its innovative support for collaborative, token-level text editing, specifically designed for NLP tasks. This unique feature positions LexiClean as a leader in text annotation technology. Originating to tackle lexical normalisation and sanitisation of concise, industry-generated content, its utility has now expanded across various text types and domains, providing unmatched adaptability and performance for processing texts of any length or domain.

**Quick links**:

- :rocket: Want to start fixing your data? Checkout the [Getting Started](#getting-started) section!
- 🙏 Want to contribute to LexiClean? Checkout the guidelines [here](./contribute).

## Example Use Cases

### Industrial Maintenance: Enhancing Work Order Texts and Accident Reports

In the industrial sector, maintenance work orders and accident reports are pivotal for operations and safety management. These documents often contain shorthand and industry-specific jargon, as well as sensitive information that needs protection. LexiClean empowers organisations to:

- **Improve Text Quality**: Facilitate human annotators to refine the clarity and readability of texts in work orders and detailed narratives in accident reports, preparing them for more effective analysis and review.
- **Mask Sensitive Information**: Enable annotators to identify and mask sensitive data manually, such as employee names, locations, and specific asset identifiers, aiding in compliance with privacy regulations.
- **Adopt NLP Techniques**: The annotated, cleaner data serves as a valuable dataset for training NLP models, allowing organisations to analyse trends, predict maintenance needs, and enhance safety protocols effectively.

### Healthcare: Refining Electronic Medical Records (EMRs)

Electronic Medical Records (EMRs) contain critical personal and sensitive patient information. LexiClean supports healthcare providers by:

- **Improving Text Quality**: Provide a platform for human annotators to enhance the readability and accuracy of medical records, aiding professionals in understanding patient histories quickly.
- **Masking Personal Identifying Information**: Assist in manually anonymising personal data such as patient names, addresses, and social security numbers, ensuring regulatory compliance.
- **Facilitating Research and Analysis**: Annotated, anonymised EMRs can be utilised for medical research and statistical analysis, advancing healthcare while safeguarding patient privacy.

### Social Media Analytics: Enhancing Text Quality on Platforms like Twitter

Social media texts, like those on Twitter and Reddit, are invaluable for NLP tasks such as sentiment analysis but often suffer from informal language use and abbreviations. LexiClean enables:

- **Improve Text Quality**: Assist annotators in standardising and refining social media texts to correct spelling errors, expand abbreviations, and improve grammar, enhancing their suitability for analysis.
- **Enhance Text Analytics Pipelines**: Cleaner data, created by human annotators, improves the accuracy of sentiment analysis, trend detection, and feedback interpretation, offering deeper insights into market dynamics.

### Call Centres: Refining Transcripts for Better Analysis

Call centre transcripts are key to understanding customer concerns and enhancing service quality. LexiClean helps call centres:

- **Improve Transcript Quality**: Enhance the readability and coherence of call transcripts through human annotation, enabling more effective use as training materials and in quality assurance.
- **Identify Key Themes and Issues**: Annotated, well-structured transcripts allow NLP tools to more effectively extract insights, identify common issues, and adapt strategies accordingly.

### Law Enforcement: Improving the Quality of Field Notes

Field notes taken by law enforcement officers are essential for investigations and legal processes. LexiClean aids in:

- **Enhancing Note Quality**: Support the improvement of note clarity and detail through manual annotation, enhancing their utility in case building and analysis.
- **Protecting Sensitive Information**: Facilitate the manual redaction of sensitive information by annotators, ensuring that documents can be shared securely within and between agencies.

By employing LexiClean in these scenarios, organisations can harness the power of human annotation to improve text quality and perform semantic tagging, creating datasets that enable the effective application of NLP and text analytics, while also ensuring data privacy and regulatory compliance.

## Guiding Principles

At its core, LexiClean is driven by principles that underline user experience, operational efficiency, and collaborative innovation:

- **Self-Contained Solution**: We aim to reduce dependence on external tools, offering a comprehensive platform that addresses all annotation needs.
- **End-to-End Annotation Workflow**: LexiClean supports the entire annotation lifecycle — from data import to constructing a gold-standard corpus, all within one seamless environment.
- **User-Focused Minimalist Design**: Our platform is designed for ease, featuring an intuitive interface that encourages user engagement without compromising functionality.
- **Open-Source Commitment**: As a fully open-source project, LexiClean thrives on community contributions, enabling enhancements that benefit all users while also supporting local installation to protect data privacy.

## Key Features

LexiClean is equipped with an array of features designed to optimise the annotation process and user experience:

- **Efficiency**: LexiClean is engineered for speed and effectiveness, accelerating the annotation process without sacrificing quality. This ensures optimal use of valuable annotation resources, enabling teams to achieve more with less.
- **Collaborative Annotation**: Enable teamwork in text refinement and semantic tagging, fostering a more efficient and precise workflow.
- **Customisable Schemas**: Tailor semantic schemas for detailed token-level tagging, providing the versatility needed for specific project requirements.
- **Real-Time Updates**: Keep abreast of your team's progress with live updates, ensuring cohesive and synchronised project development.
- **Easy Exports**: Simplify the export of annotated data and resources to ensure seamless integration with various external tools.
- **LLM Integration**: Leverage LexiClean's integration with OpenAI GPT for text improvement suggestions using just a valid API key, enhancing annotation quality and efficiency.
- **Powerful Adjudication**: Benefit from LexiClean's advanced adjudication features, providing insights into document-level and token-level inter-annotator agreement, vital for assessing annotation consistency and quality.

## Getting Started

To kick things off, we suggest starting with our easy-to-follow [Basic Tutorial](./category/tutorial---basic). This guide is packed with all the basics you'll need to get familiar with LexiClean. It's designed to give you a hands-on tour of what our tool can do.

📚 Ready to start? Jump right into the [Tutorial section on our documentation site](/category/tutorial---basic).

By working through the tutorial, you'll pick up how to:

- Set up your first project, including getting it ready and adding some initial annotations
- Annotate texts by editing words (tokens) and tagging them
- Use the project dashboard to keep track of everything
- Share your project's annotated data
- Invite friends or colleagues to work with you
- Check out how consistent annotations are across your team

After finishing the tutorial, you'll have all the tools you need to confidently dive into your own annotation projects. Run into a snag or have a question? [Get in touch with us](./contact) or look up answers in our detailed documentation.

We're thrilled to have you with us and can't wait to see what you'll achieve with LexiClean!

## Attribution

If LexiClean has been helpful in your research or work, please cite our [[conference paper]](https://aclanthology.org/2021.emnlp-demo.25/):

```
@inproceedings{bikaun-etal-2021-lexiclean,
    title = "{L}exi{C}lean: An annotation tool for rapid multi-task lexical normalisation",
    author = "Bikaun, Tyler  and
      French, Tim  and
      Hodkiewicz, Melinda  and
      Stewart, Michael  and
      Liu, Wei",
    editor = "Adel, Heike  and
      Shi, Shuming",
    booktitle = "Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing: System Demonstrations",
    month = nov,
    year = "2021",
    address = "Online and Punta Cana, Dominican Republic",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2021.emnlp-demo.25",
    doi = "10.18653/v1/2021.emnlp-demo.25",
    pages = "212--219",
}
```

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit).
