import { Confirm as ConfirmSU } from "semantic-ui-react"
import { FaTimes, FaCheck } from "react-icons/fa"
import styles from './Confirm.module.css'

export function Confirm(props) {
  const { cancelButton, confirmButton, ...rest } = props;

  const defaultCancelButton = (
    <div className={styles.iconClose}>
      <FaTimes />
    </div>
  );

  const defaultConfirmButton = (
    <div className={styles.iconCheck}>
      <FaCheck />
    </div>
  );

  return (
    <ConfirmSU
      size="mini"
      cancelButton={cancelButton || defaultCancelButton}
      confirmButton={confirmButton || defaultConfirmButton}
      {...rest}
    />
  );
}
