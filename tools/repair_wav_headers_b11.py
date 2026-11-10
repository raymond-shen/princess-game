#!/usr/bin/env python3
"""Copy-only RIFF size repair. Preserves original bytes and audits all audio in this checkout."""
import argparse,concurrent.futures,hashlib,json,pathlib,shutil,struct,subprocess,wave,datetime,zoneinfo
ROOT=pathlib.Path(__file__).resolve().parents[1]
T=ROOT/'tests_p0';BACKUP=T/'b11_wav_header_originals'
EXT={'.wav','.mp3','.ogg','.m4a','.aac','.flac','.opus','.aif','.aiff','.webm'}
def sha(b):return hashlib.sha256(b).hexdigest()
def structure(b):
 errors=[];chunks=[]
 if len(b)<12 or b[:4]!=b'RIFF' or b[8:12]!=b'WAVE':return {'errors':['not RIFF/WAVE'],'chunks':[]}
 declared=struct.unpack_from('<I',b,4)[0]
 if declared!=len(b)-8:errors.append('RIFF size mismatch')
 pos=12
 while pos<len(b):
  if pos+8>len(b):errors.append('truncated chunk header');break
  tag=b[pos:pos+4];n=struct.unpack_from('<I',b,pos+4)[0];end=pos+8+n
  chunks.append({'id':tag.decode('ascii',errors='replace'),'offset':pos,'size':n})
  if end>len(b):errors.append('chunk exceeds file');break
  pos=end+(n&1)
 if pos!=len(b):errors.append('chunk coverage mismatch')
 fmt=[c for c in chunks if c['id']=='fmt '];data=[c for c in chunks if c['id']=='data']
 if len(fmt)!=1 or len(data)!=1:errors.append('expected one fmt/data chunk')
 if len(fmt)==1 and fmt[0]['size']>=16:
  c=fmt[0];code,ch,sr,br,align,bits=struct.unpack_from('<HHIIHH',b,c['offset']+8)
  if code!=1 or bits!=16 or ch<1 or sr<1:errors.append('not standard 16-bit PCM')
  if align!=ch*bits//8 or br!=sr*align:errors.append('invalid PCM format sizes')
  if data and data[0]['size']%align:errors.append('partial PCM frame')
 else:errors.append('invalid fmt chunk')
 regions=[b[c['offset']+8:c['offset']+8+c['size']] for c in data]
 return {'errors':errors,'riffSize':declared,'bytes':len(b),'chunks':chunks,'pcmSHA256':sha(b''.join(regions)),'pcmBytes':sum(map(len,regions))}
def audit(p):
 rel=str(p.relative_to(ROOT));b=p.read_bytes();r={'path':rel,'fileSHA256':sha(b),'scope':'runtime' if p.is_relative_to(ROOT/'assets') else 'preserved test/original artifact'}
 if p.suffix.lower()=='.wav':
  r.update(structure(b))
  try:
   with wave.open(str(p)) as w:
    n=w.getnframes();data=w.readframes(n);r['wave']={'channels':w.getnchannels(),'sampleRate':w.getframerate(),'sampleBytes':w.getsampwidth(),'frames':n,'decodedBytes':len(data)}
    if len(data)!=n*w.getnchannels()*w.getsampwidth():r['errors'].append('wave short PCM read')
    if sha(data)!=r.get('pcmSHA256'):r['errors'].append('wave/region PCM hash mismatch')
  except Exception as e:r.setdefault('errors',[]).append('wave: '+str(e))
 else:r['errors']=[]
 q=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)],capture_output=True,text=True,timeout=30);r['ffprobeExit']=q.returncode;r['ffprobeErrors']=q.stderr.strip();r['streams']=json.loads(q.stdout or '{}').get('streams',[])
 if q.returncode or q.stderr.strip():r['errors'].append('ffprobe error')
 q=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(p),'-f','null','-'],capture_output=True,text=True,timeout=30);r['fullDecodeExit']=q.returncode;r['fullDecodeErrors']=q.stderr.strip()
 if q.returncode or q.stderr.strip():r['errors'].append('ffmpeg full decode error')
 return r

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--apply',action='store_true');args=ap.parse_args();T.mkdir(exist_ok=True);fixed=[]
 beforePaths=sorted(p for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.relative_to(ROOT).parts and p.suffix.lower() in EXT)
 beforeHashes={str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in beforePaths}
 for p in beforePaths:
  if not p.is_relative_to(ROOT/'assets') or p.suffix.lower()!='.wav':continue
  b=p.read_bytes();s=structure(b)
  if not s['errors']:continue
  if s['errors']!=['RIFF size mismatch']:raise RuntimeError('Deeper issue needs separate review/re-encode: '+str(p)+str(s['errors']))
  rec={'path':str(p.relative_to(ROOT)),'before':s,'beforeFileSHA256':sha(b),'headerFields':['RIFF size @ bytes 4..7'],'reencoded':False}
  if args.apply:
   if p.is_symlink():raise RuntimeError('refusing symlink')
   BACKUP.mkdir(exist_ok=True);backup=BACKUP/p.name
   if backup.exists():assert backup.read_bytes()==b,'original backup differs'
   else:shutil.copy2(p,backup)
   # Copy, then edit a separate inode, then replace ONLY the copy runtime asset.
   tmp=p.with_name(p.name+'.headerfix.tmp');shutil.copy2(backup,tmp);out=bytearray(tmp.read_bytes());struct.pack_into('<I',out,4,len(out)-8);tmp.write_bytes(out)
   after=structure(bytes(out));assert not after['errors'];assert s['pcmSHA256']==after['pcmSHA256'];assert bytes(out[:4])==b[:4] and bytes(out[8:])==b[8:];tmp.replace(p)
   rec.update(after=after,afterFileSHA256=sha(bytes(out)),pcmHashMatches=True,onlyRIFFSizeBytesChanged=True,originalBackup=str(backup.relative_to(ROOT)))
  fixed.append(rec)
 allpaths=sorted(p for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.relative_to(ROOT).parts and p.suffix.lower() in EXT)
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:rows=list(pool.map(audit,allpaths))
 runtime=[x for x in rows if x['scope']=='runtime'];preserved=[x for x in rows if x['scope']!='runtime'];other=[]
 fixedPaths={x['path']for x in fixed}
 for rel,digest in beforeHashes.items():
  if rel not in fixedPaths and sha((ROOT/rel).read_bytes())!=digest:other.append(rel)
 assert not other,'unrelated audio changed'
 r={'timestamp':datetime.datetime.now(zoneinfo.ZoneInfo('Asia/Singapore')).isoformat(),'applied':args.apply,'fixed':fixed,'fixedCount':len(fixed),'reencodes':[],'allAudioScanned':len(rows),'runtimeCount':len(runtime),'runtimeFailures':[x for x in runtime if x['errors']],'preservedArtifactCount':len(preserved),'preservedArtifactKnownRiffMismatches':[x['path']for x in preserved if x['errors']==['RIFF size mismatch']],'preservedArtifactOtherAnomalies':[x for x in preserved if x['errors'] and x['errors']!=['RIFF size mismatch']],'unrelatedAudioChanged':other,'files':rows}
 (T/('b11_wav_header_repair_result.json' if args.apply and fixed else 'b11_wav_header_audit_result.json')).write_text(json.dumps(r,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in r.items() if k not in ['fixed','files','preservedArtifactKnownRiffMismatches']},ensure_ascii=False,indent=2))
 assert not r['runtimeFailures'] and not r['preservedArtifactOtherAnomalies']
if __name__=='__main__':main()
