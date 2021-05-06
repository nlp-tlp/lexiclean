import React from 'react';
import { createUseStyles } from 'react-jss';

import Text from './Text';

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '80%',
    margin: 'auto'
  },
  row: {
    display: 'flex',
    padding: '1em',
    backgroundColor: '#F2F2F2',
    marginTop: '0.5em'
  },
  textColumn: {
    marginLeft: '1em',
    minHeight: '2em'
  },
  indexColumn: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginLeft: '2em',
    paddingRight: '2em',
    marginRight: '1em',
    width: '1em'
  }
});

export default function AnnotationTable({texts, tokens_en, tokens_ds, lexNormDict, setLexNormDict}) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {
        texts.map((text, textIndex) => {
          return(
            <div className={classes.row}>
              <div className={classes.indexColumn}>{textIndex+1}</div>
              <div className={classes.textColumn}>
                <Text
                  text={text}
                  textIndex={textIndex}
                  tokens_en={tokens_en}
                  tokens_ds={tokens_ds}
                  lexNormDict={lexNormDict}
                  setLexNormDict={setLexNormDict}
                  />
              </div>
            </div>
          )
        })
      }
    </div>
  );
}
