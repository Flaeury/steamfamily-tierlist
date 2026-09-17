"use client";
import { useState } from "react";
import { Card, CardContent, CardActions, Typography, IconButton, Chip, Box, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

interface Props {
  appid: number; name: string; liked: boolean; likeCount: number; purchased: boolean;
  isAdmin?: boolean;
  onLike: () => void; onBuy: () => void; onDelete?: () => void;
}

export default function GameCard({ appid, name, liked, likeCount, purchased, isAdmin, onLike, onBuy, onDelete }: Props) {
  const [imgError, setImgError] = useState(false);
  const header = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;

  return (
    <Card sx={{ overflow: "hidden", position: "relative" }}>
      <Box sx={{ width: "100%", aspectRatio: "460/215", position: "relative", bgcolor: "rgba(155,109,255,0.08)" }}>
        {!imgError ? (
          <Box
            component="img" src={header} alt={name} onError={() => setImgError(true)}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SportsEsportsIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.2)" }} />
          </Box>
        )}
        {purchased && (
          <Chip label="JÁ TEMOS" size="small" sx={{ position: "absolute", top: 8, right: 8, bgcolor: "#9b6dff", color: "#fff", fontWeight: 700 }} />
        )}
        {isAdmin && onDelete && (
          <Tooltip title="Remover jogo pra sempre">
            <IconButton
              size="small" onClick={onDelete}
              sx={{ position: "absolute", top: 8, left: 8, bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(200,0,0,0.7)" } }}
            >
              <DeleteOutlineIcon fontSize="small" sx={{ color: "#fff" }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <CardContent sx={{ pb: 1 }}>
        <Typography noWrap title={name} sx={{ color: "#fff", fontWeight: 600 }}>{name}</Typography>
        <Typography variant="caption" color="text.secondary">AppID {appid}</Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton onClick={onLike} size="small" sx={{ color: liked ? "#ff6ec7" : "#a3a8c2" }}>
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2">{likeCount}</Typography>
        </Box>
        <IconButton onClick={onBuy} size="small" sx={{ color: purchased ? "#66c0f4" : "#a3a8c2" }}>
          {purchased ? <ShoppingCartIcon /> : <ShoppingCartOutlinedIcon />}
        </IconButton>
      </CardActions>
    </Card>
  );
}