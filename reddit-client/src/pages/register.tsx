import Head from 'next/head'
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import Axios from 'axios';
import InputGroup from '../compoents/InputGroup';
import { useRouter } from 'next/router';

export default function Register() {

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const router = useRouter();

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    if (!agreement) {
      setErrors({ ...errors, agreement: 'You must agree to T&Cs' })
      return
    }
    try {
        const res = await Axios.post('/auth/register', {
          email, password, username
        });
      router.push('/login');
      
    } catch (error) { 
      setErrors(error.response.data);
    }

  }
  return (
    <div className="flex bg-white">
      <Head>
        <title>Regiter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
    </div>
  )
}
