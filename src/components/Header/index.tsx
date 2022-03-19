import styles from './header.module.scss'
import Link from 'next/link'
export default function Header() {
  // TODO

  return (
    <div className={styles.ContainerLogo}>
      <div className={styles.logo}>
        <Link href="/">
        <a>
        <img src="/images/Logo.svg" alt='logo'/>
        </a>
        </Link>
      </div>
    </div>
  )
}
