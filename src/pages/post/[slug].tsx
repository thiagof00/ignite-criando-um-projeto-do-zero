import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../../services/prismic';
import ptBR from 'date-fns/locale/pt-BR'
import {FiCalendar, FiUser, FiClock} from 'react-icons/fi'

import commonStyles from '../../styles/common.module.scss';
import styles from './posting.module.scss';
import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}:PostProps) {
  // TODO
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  const countContent = post.data.content.reduce((previousValue, currentValue)=>{
    var countWordsIndHeading = currentValue.heading.split(' ').length
    var contWordInBody = RichText.asText(currentValue.body).split(' ').length

    return previousValue + contWordInBody + countWordsIndHeading
  }, 0)

  const wordPerMinut = 200

  const readTime = Math.round(countContent/wordPerMinut)
console.log(countContent)
  const [Post, setPost] = useState<Post>(()=>{
   const loadPost = {
      first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {locale: ptBR}),
      data: {
        title: post.data.title,
        banner: {
          url: post.data.banner.url
        },
        author: post.data.author,
        content: post.data.content
      }
    }

    return loadPost
  })

  return (

      <main className={styles.box}>
        <div className={styles.banner}>
          <img src={Post.data.banner.url} alt="banner"/>
        </div>
        <div className={styles.content}>
        <header>
          <h1>{Post.data.title}</h1>
          <div className={styles.info}>
            <time className={styles.date}>
            <FiCalendar/>
            <span>{Post.first_publication_date}</span>
            </time>
            <div className={styles.author}>
            <FiUser/>
            <span>{Post.data.author}</span>
      
            </div>
            <div className={styles.posted}>
            <FiClock/>
            <span>{readTime+1} min</span>
            </div>
          </div>
        </header>

        <div className={styles.texts}>
          {Post.data.content.map(contents=>(
            <div key={contents.heading}>
            <h2 >{contents.heading}</h2>
            {contents.body.map(content=>(
              <p>{content.text}</p>
            ))}
            </div>
          ))}
        </div>
      </div>

      </main>
    )
}

export const getStaticPaths:GetStaticPaths = async () => {
  const prismic = getPrismicClient();
   const posts = await prismic.query(
     Prismic.Predicates.at('document.type','posts'),
     {
       pageSize: 1,
       fetch: 'posts.uid'
     }
   );

    const paths = posts.results.map(post=>({
      
      params:{
        slug: post.uid
      }
    }))


  return{
    paths,
    fallback: true
  }
  
};

export const getStaticProps:GetStaticProps = async ({params}) => {
  const prismic = getPrismicClient();
  const uid = String(params.slug)
  const response = await prismic.getByUID('posts', uid, {});

  const post = response

  console.log(post)
  // TODO
  return{
    props:{
      post
    }
  }
};
