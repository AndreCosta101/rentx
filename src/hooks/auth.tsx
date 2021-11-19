import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { api } from '../services/api';
import { database } from '../database';
import { User as UserModel } from '../database/model/User';

interface User {
  id: string; //api
  user_id: string;  // watermelondb
  email: string;
  name: string;
  driver_license: string;
  avatar: string;
  token: string;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn: (credentials: SignInCredentials) => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [data, setData] = useState<User>({} as User);

  async function signIn({ email, password }: SignInCredentials) {
    try {

      const response = await api.post('/sessions', {
        email,
        password
      });

      const { token, user } = response.data;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      const userCollection = database.get<UserModel>('users');
      console.log('DATABASE');

      console.log(database.collections)
      await database.write(async () => {
        await userCollection.create((newUser) => {
          newUser.user_id = user.id,
            newUser.name = user.name,
            newUser.email = user.email,
            newUser.driver_license = user.driver_license,
            newUser.avatar = user.avatar,
            newUser.token = token
        })
      });



      setData({ ...user, token });

    } catch (error) {

      throw new Error(error as string)
    }
  }

  useEffect(() => {
    async function loadUserData() {
      const userCollection = database.get<UserModel>('users');
      const response = await userCollection.query().fetch();
      console.log('## USUÁRIO LOGADO ##')
      console.log(response)
    }
    loadUserData();

  });

  return (
    <AuthContext.Provider value={{
      user: data,
      signIn
    }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth(): AuthContextData {
  const context = useContext(AuthContext)

  return context;
}

export { AuthProvider, useAuth }