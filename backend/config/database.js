const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb')

const id = encodeURIComponent(process.env.MONGO_ID);
const password = encodeURIComponent(process.env.MONGO_PASSWORD);
const cluster = process.env.MONGO_CLUSTER;
const appName = process.env.MONGO_APPNAME;

const url = `mongodb+srv://${id}:${password}@${cluster}/?retryWrites=true&w=majority&appName=${appName}`

let db;
const connectDB = async () => {
    if(db) return db;
    const client = await new MongoClient(url).connect();
    db = client.db('forum');
    console.log('DB 연결 성공');
    return db;
}

module.exports = connectDB;