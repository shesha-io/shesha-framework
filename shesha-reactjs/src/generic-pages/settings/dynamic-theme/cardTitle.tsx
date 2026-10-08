import { FC, ReactNode } from 'react';
import { useStyles } from './styles/styles';

export interface ICardTitleProps {
  title: ReactNode;
  description: ReactNode;
}

/** Heading with a one-line description, used as the title of every theme settings card. */
export const CardTitle: FC<ICardTitleProps> = ({ title, description }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.cardTitle}>
      <h4>{title}</h4>
      <span className={styles.description}>{description}</span>
    </div>
  );
};
