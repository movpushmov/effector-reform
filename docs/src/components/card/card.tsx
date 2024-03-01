import { FC, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './card.module.css';

interface CardProps {
  icon: ReactNode;

  title: string;
  description: string;
}

export const Card: FC<CardProps> = (props) => {
  return (
    <article className={clsx(styles.card)}>
      <div className={styles.icon}>{props.icon}</div>
      <h3 className={styles.title}>{props.title}</h3>
      <p className={styles.description}>{props.description}</p>
    </article>
  );
};
