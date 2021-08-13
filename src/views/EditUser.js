import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from '@reach/router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Logout } from './';
import { makeStyles, Button, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@material-ui/core';
import { useEnvironment, useServer } from '../contexts';


const useStyles = makeStyles((theme) => ({
    link_button: {
        textDecoration: "none"
    },
    filter_textfield: {
        marginLeft: '2vw'
    },
    add_button: {
        color: '#04bdaf'
    }
}));

export const EditUser = (props) => {
    const auth = localStorage.getItem('zmt-token');
    if (auth === null) {
        return <Logout />
    }
    const currentUser = props.location.state.userInfo;
    const classes = useStyles();
    const [isLoading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const { restApiLocation } = useEnvironment();
    const { zoneName } = useServer();
    const [groupsOfUser, setGroupOfUser] = useState([]);
    const [filterGroupName, setFilterName] = useState('');
    const [filterGroupNameResult, setFilterNameResult] = useState([]);

    useEffect(() => {
        setLoading(true);
        axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Accept': 'application/json',
                'Authorization': auth
            },
            params: {
                query_string: `SELECT USER_GROUP_NAME WHERE USER_NAME = '${currentUser[0]}' AND USER_GROUP_NAME != '${currentUser[0]}'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then((res) => {
            setGroupOfUser(res.data._embedded);
            setLoading(false);
        })
    }, [refresh])

    useEffect(() => {
        axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': auth,
            },
            params: {
                query_string: `SELECT USER_NAME WHERE USER_GROUP_NAME LIKE '%${filterGroupName}%' AND USER_TYPE = 'rodsgroup'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then((res) => {
            setFilterNameResult(res.data._embedded);
        })
    }, [filterGroupName])

    async function removeGroupFromUser(props) {
        try {
            await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: props[0],
                    arg3: 'remove',
                    arg4: currentUser[0],
                    arg5: zoneName
                },
                headers: {
                    'Authorization': auth,
                    'Accept': 'application/json'
                }
            }).then((res) => {
                setRefresh(!refresh);
            })
        } catch (e) {
            alert(e)
        }

    }

    async function addGroupToUser(props) {
        try {
            await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: props[0],
                    arg3: 'add',
                    arg4: currentUser[0],
                    arg5: zoneName
                },
                headers: {
                    'Authorization': auth,
                    'Accept': 'application/json'
                }
            }).then((res) => {
                setRefresh(!refresh);
            })
        }
        catch (e) {
            alert(e)
        }
    }

    const checkGroup = (group) => {
        for (let i = 0; i < groupsOfUser.length; i++) {
            if (groupsOfUser[i][0] === group[0]) {
                return true;
            }
        }
        return false;
    }

    return (
        <Fragment>
            <Link to="/users" className={classes.link_button}><Button><ArrowBackIcon /></Button></Link>
            {currentUser[0]}
            <div className="edit_filter_bar">
                <Typography>Find Group</Typography>
                <TextField
                    id="filterGroupName"
                    label="Filter GroupName"
                    className={classes.filter_textfield}
                    onChange={(e) => setFilterName(e.target.value)}
                />
            </div>
            <br />
            <div className="edit_container">
                {filterGroupNameResult.length > 0 ?
                    <Table className={classes.user_table} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Group Name</b></TableCell>
                                <TableCell align="right"><b>Status</b></TableCell>
                                <TableCell align="right"><b>Action</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filterGroupNameResult.map((thisGroup) => <TableRow key={thisGroup[0]}>
                                <TableCell component="th" scope="row">{thisGroup[0]}</TableCell>
                                <TableCell align="right">{checkGroup(thisGroup) ? "In group" : "Not in group"}</TableCell>
                                <TableCell align='right'>{checkGroup(thisGroup) ? <Button color="secondary" onClick={() => { removeGroupFromUser(thisGroup) }}>Remove</Button> : <Button className={classes.add_button} onClick={() => { addGroupToUser(thisGroup) }}>Add</Button>}</TableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table> : <br />}
            </div>
            {isLoading === true ? <div><LinearProgress /></div> : <div />}
        </Fragment>
    );
}