import { useRouter } from 'next/router'
import Link from 'next/link'

const defaultProps = {
  activeClassName: '',
}

export const NavLink = ({
  href,
  children,
  className,
  activeClassName,
  shallow,
  as,
}) => {
  const router = useRouter()

  return (
    <Link href={href} shallow={shallow} as={as}>
      <a
        className={`${className || ''}${
          router.pathname === href ? ' ' + (activeClassName || '') : ''
        }`}
      >
        {children}
      </a>
    </Link>
  )
}

NavLink.defaultProps = defaultProps
