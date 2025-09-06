
import styles from './History.module.css';
import { Skeleton } from '@mui/material';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import { useState, useEffect, useContext } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';

const History = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);

  const { userInfo } = useContext(AuthContext);

  useEffect(() => {

    const fetchUserData = async () => {
      setLoader(true)
      {/* Please watch the video for ful source code */ }

    }

    fetchUserData()
  }, [])

  return (
    <div className={styles.History}>
      <div className={styles.HistoryCardBlock}>

        {
          loader && <>

            <Skeleton
              variant="rectangular"
              width={266}
              height={200}
              sx={{ borderRadius: "20px" }}
            />
            <Skeleton
              variant="rectangular"
              width={266}
              height={200}
              sx={{ borderRadius: "20px" }}
            />
            <Skeleton
              variant="rectangular"
              width={266}
              height={200}
              sx={{ borderRadius: "20px" }}
            />
            <Skeleton
              variant="rectangular"
              width={266}
              height={200}
              sx={{ borderRadius: "20px" }}
            />

          </>
        }

        {
          data.map((item, index) => {
            return (
              <div key={item._id} className={styles.HistoryCard}>
                <div className={styles.cardPercentage}>{item.score}%</div>
                {/* <h2 >{Frontend Developer}</h2> */}
                <p>Resume Name : {item.resume_name}</p>
                <p>{item.feedback}</p>
                <p>Dated : {item.createdAt.slice(0, 10)}</p>
              </div>
            );
          })
        }



      </div>

    </div>
  )
}

export default WithAuthHOC(History)