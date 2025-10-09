import { BiSolidToggleLeft, BiSolidToggleRight } from 'react-icons/bi'
import styles from './Toggle.module.css'
import { useState } from 'react'

export function Toggle() {

  const [toggle, setToggle] = useState(false)
  
  const onToggle = () => setToggle((prevState) => !prevState)

  return (
    
    <>
    
      {toggle ?
        <div className={styles.toggleON}>
          <BiSolidToggleRight onClick={onToggle} /> 
        </div>
        :
        <div className={styles.toggleOFF}>
          <BiSolidToggleLeft onClick={onToggle}/>
        </div>
      }
    
    </>

  )
}
