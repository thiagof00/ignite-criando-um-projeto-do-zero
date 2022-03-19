import { GetStaticProps } from 'next';
import {FiCalendar, FiUser} from 'react-icons/fi'
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import Link  from 'next/link';
import ptBR from 'date-fns/locale/pt-BR'
import { format } from 'date-fns';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}:HomeProps) {
  // TODO

  const [posts, setPosts] = useState<Post[]>(()=>{
    const loadPosts:Post[] = postsPagination.results.map(post=>{
      return {
        uid: post.uid,
        first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {locale: ptBR}),
        data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })
  return loadPosts

  })

  const [nextPage, setNextPage] = useState(postsPagination.next_page)


  async function LoadPosts(){
    const loadPosts = await fetch(nextPage).then(response=>response.json()
    .then((posts:ApiSearchResponse)=>posts))

    const nextPosts:Post[] = loadPosts.results.map(post=>{
      return {
        uid: post.uid,
        first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {locale: ptBR}),
        data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })
    setPosts([...posts, ...nextPosts])
    setNextPage(loadPosts.next_page)
  }


  return(
    
    <main className={styles.content}>
      {posts.map(post=>(

      <div className={styles.post} key={post.uid}>

        <Link href={`post/${post.uid}`}>
          <a>
            <h1>{post.data.title}</h1>
          </a>
        </Link>
      <strong>{post.data.subtitle}</strong>
      <div className={styles.info}>
        <div>
        <FiCalendar/>
        <time>
          {post.first_publication_date}</time>
        </div>
        <div className={styles.author}>
        <FiUser/>
          <span>
          {post.data.author}</span>
        </div>
        
      </div>
    </div>
      ))}

      {nextPage && (<button className={styles.loadPosts} 
      onClick={()=>{LoadPosts()}}>
        Carregar mais posts
      </button>)}
    </main>
  )
}

export const getStaticProps:GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {pageSize:1,
    fetch:['post.title', 'post.subtitle', 'post.author'] 
    }
  )

  const loadPosts:Post[] = postsResponse.results.map(post=>{
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author
    }
  }
})
  return {
    props: {
      postsPagination: {
        next_page:postsResponse.next_page,
        results:loadPosts
      }
    }
  }
};
