import json
import pandas as pd
import numpy as np

classifications = ['<sensitive>', '<remove>', '<noise>']

input_en_words = 'en_words.json'
input_data_name = 'input_data_1000.txt'

with open(input_en_words) as fj:
    en_words = set(json.load(fj))

with open(input_data_name) as f:
    lines = f.readlines()
    lines = list(set([line.replace('\n', '') for line in lines]))

# check whether OOV candidates exist in lines
df_data = {'line': [], 'oov_tokens': []}
for line in lines:
    oov_tokens = [token for token in line.split() if token not in en_words]
    df_data['line'].append(line)
    df_data['oov_tokens'].append(oov_tokens)

df = pd.DataFrame(df_data)
for col in classifications:
    df[col] = [None]*len(df)

df = df.explode('oov_tokens')
df.to_csv('test_exp.csv')
