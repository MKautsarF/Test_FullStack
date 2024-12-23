PGDMP     7                    |            Attendance_1    13.2    13.2     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16917    Attendance_1    DATABASE     n   CREATE DATABASE "Attendance_1" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'English_Indonesia.1252';
    DROP DATABASE "Attendance_1";
                postgres    false            �            1255    25135    set_employee_name()    FUNCTION     0  CREATE FUNCTION public.set_employee_name() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
            BEGIN
                SELECT "Name" INTO NEW."EmployeeName" 
                FROM "Employee" 
                WHERE "ID" = NEW."EmployeeID";
                RETURN NEW;
            END;
            $$;
 *   DROP FUNCTION public.set_employee_name();
       public          postgres    false            �            1259    25224    AttendanceLog    TABLE     �   CREATE TABLE public."AttendanceLog" (
    "ID" integer NOT NULL,
    "EmployeeID" integer NOT NULL,
    "EmployeeName" character varying(255),
    "Date" date NOT NULL,
    "Hour" time without time zone NOT NULL,
    "File" bytea NOT NULL
);
 #   DROP TABLE public."AttendanceLog";
       public         heap    postgres    false            �            1259    25222    AttendanceLog_EmployeeID_seq    SEQUENCE     �   CREATE SEQUENCE public."AttendanceLog_EmployeeID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public."AttendanceLog_EmployeeID_seq";
       public          postgres    false    204            �           0    0    AttendanceLog_EmployeeID_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public."AttendanceLog_EmployeeID_seq" OWNED BY public."AttendanceLog"."EmployeeID";
          public          postgres    false    203            �            1259    25220    AttendanceLog_ID_seq    SEQUENCE     �   CREATE SEQUENCE public."AttendanceLog_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public."AttendanceLog_ID_seq";
       public          postgres    false    204            �           0    0    AttendanceLog_ID_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public."AttendanceLog_ID_seq" OWNED BY public."AttendanceLog"."ID";
          public          postgres    false    202            �            1259    25186    Employee    TABLE     �  CREATE TABLE public."Employee" (
    "ID" integer NOT NULL,
    "Name" character varying(255) NOT NULL,
    "Username" character varying(255) NOT NULL,
    "Password" character varying(255) NOT NULL,
    "EmailAddress" character varying(255) NOT NULL,
    "Division" character varying(255) NOT NULL,
    "Position" character varying(255) NOT NULL,
    "IsAdmin" boolean DEFAULT false NOT NULL
);
    DROP TABLE public."Employee";
       public         heap    postgres    false            �            1259    25184    Employee_ID_seq    SEQUENCE     �   CREATE SEQUENCE public."Employee_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public."Employee_ID_seq";
       public          postgres    false    201            �           0    0    Employee_ID_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."Employee_ID_seq" OWNED BY public."Employee"."ID";
          public          postgres    false    200            /           2604    25227    AttendanceLog ID    DEFAULT     z   ALTER TABLE ONLY public."AttendanceLog" ALTER COLUMN "ID" SET DEFAULT nextval('public."AttendanceLog_ID_seq"'::regclass);
 C   ALTER TABLE public."AttendanceLog" ALTER COLUMN "ID" DROP DEFAULT;
       public          postgres    false    204    202    204            0           2604    25228    AttendanceLog EmployeeID    DEFAULT     �   ALTER TABLE ONLY public."AttendanceLog" ALTER COLUMN "EmployeeID" SET DEFAULT nextval('public."AttendanceLog_EmployeeID_seq"'::regclass);
 K   ALTER TABLE public."AttendanceLog" ALTER COLUMN "EmployeeID" DROP DEFAULT;
       public          postgres    false    204    203    204            -           2604    25189    Employee ID    DEFAULT     p   ALTER TABLE ONLY public."Employee" ALTER COLUMN "ID" SET DEFAULT nextval('public."Employee_ID_seq"'::regclass);
 >   ALTER TABLE public."Employee" ALTER COLUMN "ID" DROP DEFAULT;
       public          postgres    false    200    201    201            �          0    25224    AttendanceLog 
   TABLE DATA           e   COPY public."AttendanceLog" ("ID", "EmployeeID", "EmployeeName", "Date", "Hour", "File") FROM stdin;
    public          postgres    false    204   �       �          0    25186    Employee 
   TABLE DATA           }   COPY public."Employee" ("ID", "Name", "Username", "Password", "EmailAddress", "Division", "Position", "IsAdmin") FROM stdin;
    public          postgres    false    201   �       �           0    0    AttendanceLog_EmployeeID_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public."AttendanceLog_EmployeeID_seq"', 1, false);
          public          postgres    false    203            �           0    0    AttendanceLog_ID_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."AttendanceLog_ID_seq"', 2, true);
          public          postgres    false    202            �           0    0    Employee_ID_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."Employee_ID_seq"', 14, true);
          public          postgres    false    200            6           2606    25233     AttendanceLog AttendanceLog_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."AttendanceLog"
    ADD CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("ID");
 N   ALTER TABLE ONLY public."AttendanceLog" DROP CONSTRAINT "AttendanceLog_pkey";
       public            postgres    false    204            2           2606    25197    Employee Employee_Username_key 
   CONSTRAINT     c   ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_Username_key" UNIQUE ("Username");
 L   ALTER TABLE ONLY public."Employee" DROP CONSTRAINT "Employee_Username_key";
       public            postgres    false    201            4           2606    25195    Employee Employee_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("ID");
 D   ALTER TABLE ONLY public."Employee" DROP CONSTRAINT "Employee_pkey";
       public            postgres    false    201            8           2620    25239 '   AttendanceLog set_employee_name_trigger    TRIGGER     �   CREATE TRIGGER set_employee_name_trigger BEFORE INSERT ON public."AttendanceLog" FOR EACH ROW EXECUTE FUNCTION public.set_employee_name();
 B   DROP TRIGGER set_employee_name_trigger ON public."AttendanceLog";
       public          postgres    false    204    205            7           2606    25234 +   AttendanceLog AttendanceLog_EmployeeID_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."AttendanceLog"
    ADD CONSTRAINT "AttendanceLog_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES public."Employee"("ID");
 Y   ALTER TABLE ONLY public."AttendanceLog" DROP CONSTRAINT "AttendanceLog_EmployeeID_fkey";
       public          postgres    false    201    204    2868            �      x������ � �      �   r   x�3��N,-)N,�̆�F��������\������ĢT��Լ��"_�5/=3/5��3�˜31%73� Y�eh�Y�Z\B��243M	�\�&`�2�����F@�i\1z\\\ ��]b     